const webpush = require('web-push');

// VAPID keys configuration
// Generate keys with: npx web-push generate-vapid-keys
// Or use the generateVapidKeys() function below

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Only configure if keys are provided
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:syedhusban@radiantsolutionsrs.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// Function to generate new VAPID keys (for development)
function generateVapidKeys() {
  const keys = webpush.generateVAPIDKeys();
  console.log('\n=== VAPID Keys Generated ===');
  console.log('Public Key:', keys.publicKey);
  console.log('Private Key:', keys.privateKey);
  console.log('\nAdd these to your .env file:');
  console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:syedhusban@radiantsolutionsrs.com`);
  console.log('===========================\n');
  return keys;
}

// Send push notification
async function sendPushNotification(subscription, payload) {
  try {
    const options = {
      TTL: 60 * 60 * 24, // 24 hours
      vapidDetails: {
        subject: process.env.VAPID_SUBJECT || 'mailto:admin@optimars.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey
      }
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload), options);
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    
    // Handle subscription errors (expired, invalid, etc.)
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription has expired or is no longer valid
      return { success: false, expired: true };
    }
    
    return { success: false, error: error.message };
  }
}

module.exports = {
  webpush,
  vapidKeys,
  generateVapidKeys,
  sendPushNotification
};
