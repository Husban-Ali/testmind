const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const webpush = require('web-push');

// VAPID configuration - will be initialized on first use
let vapidInitialized = false;

function initializeVapid() {
  if (vapidInitialized) return true;
  
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:syedhusban@radiantsolutionsrs.com';
  
  if (vapidPublicKey && vapidPrivateKey) {
    try {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      console.log('[PUSH] ✅ VAPID keys configured successfully');
      console.log('[PUSH] Public Key:', vapidPublicKey.substring(0, 20) + '...');
      vapidInitialized = true;
      return true;
    } catch (error) {
      console.error('[PUSH] ❌ Error setting VAPID details:', error.message);
      return false;
    }
  } else {
    console.error('[PUSH] ⚠️  WARNING: VAPID keys not found in environment variables!');
    console.error('[PUSH] VAPID_PUBLIC_KEY:', vapidPublicKey ? 'SET' : 'MISSING');
    console.error('[PUSH] VAPID_PRIVATE_KEY:', vapidPrivateKey ? 'SET' : 'MISSING');
    return false;
  }
}

// Get VAPID public key
function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY;
}

// @route   GET /api/push/vapid-public-key
// @desc    Get VAPID public key for client-side subscription
// @access  Public
router.get('/vapid-public-key', (req, res) => {
  try {
    console.log('[PUSH] Vapid public key requested');
    
    // Initialize VAPID if not already done
    initializeVapid();
    
    const publicKey = getVapidPublicKey();
    
    if (!publicKey) {
      console.error('[PUSH] ❌ Public key is not available');
      return res.status(500).json({
        success: false,
        error: 'VAPID keys not configured on server',
        message: 'Please add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env file and restart the server',
        hint: 'Run: node generateVapidKeys.js to generate keys'
      });
    }

    console.log('[PUSH] ✅ Returning public key:', publicKey.substring(0, 20) + '...');
    return res.status(200).json({
      success: true,
      publicKey: publicKey
    });
  } catch (error) {
    console.error('[PUSH] ❌ Error in vapid-public-key endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load VAPID public key',
      message: error.message
    });
  }
});

// @route   POST /api/push/subscribe
// @desc    Subscribe to push notifications
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription object'
      });
    }

    // Get user agent for tracking
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Check if subscription already exists
    const user = await User.findById(req.user.id);
    const existingIndex = user.pushSubscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingIndex !== -1) {
      // Update existing subscription
      user.pushSubscriptions[existingIndex] = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent,
        createdAt: Date.now()
      };
    } else {
      // Add new subscription
      user.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent,
        createdAt: Date.now()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Subscription saved successfully'
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save subscription'
    });
  }
});

// @route   POST /api/push/unsubscribe
// @desc    Unsubscribe from push notifications
// @access  Private
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required'
      });
    }

    const user = await User.findById(req.user.id);
    user.pushSubscriptions = user.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    await user.save();

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe'
    });
  }
});

// @route   POST /api/push/test
// @desc    Send test notification (for testing)
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No push subscriptions found'
      });
    }

    const payload = {
      type: 'test',
      title: 'Test Notification',
      body: 'This is a test push notification from Optima RS',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/dashboard'
      }
    };

    // Send to all user's subscriptions
    const results = await Promise.all(
      user.pushSubscriptions.map(async (sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };
        return sendPushNotification(subscription, payload);
      })
    );

    // Remove expired subscriptions
    const validSubscriptions = user.pushSubscriptions.filter((sub, index) => {
      return !results[index].expired;
    });

    if (validSubscriptions.length !== user.pushSubscriptions.length) {
      user.pushSubscriptions = validSubscriptions;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Test notification sent',
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// Helper function to send notification to specific user
async function sendNotificationToUser(userId, payload) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return { success: false, message: 'No subscriptions found' };
    }

    const results = await Promise.all(
      user.pushSubscriptions.map(async (sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };
        return sendPushNotification(subscription, payload);
      })
    );

    // Remove expired subscriptions
    const validSubscriptions = user.pushSubscriptions.filter((sub, index) => {
      return !results[index].expired;
    });

    if (validSubscriptions.length !== user.pushSubscriptions.length) {
      user.pushSubscriptions = validSubscriptions;
      await user.save();
    }

    return {
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to send push notification
async function sendPushNotification(subscription, payload) {
  try {
    // Ensure VAPID is initialized
    if (!initializeVapid()) {
      console.error('[PUSH] Cannot send notification - VAPID not initialized');
      return { success: false, error: 'VAPID not configured' };
    }
    
    const options = {
      TTL: 60 * 60 * 24, // 24 hours
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload), options);
    return { success: true };
  } catch (error) {
    console.error('[PUSH] Notification send error:', error);
    
    // Handle subscription errors (expired, invalid, etc.)
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription has expired or is no longer valid
      return { success: false, expired: true };
    }
    
    return { success: false, error: error.message };
  }
}

module.exports = router;
module.exports.sendNotificationToUser = sendNotificationToUser;
