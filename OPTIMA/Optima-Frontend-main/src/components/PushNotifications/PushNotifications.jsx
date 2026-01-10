import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PushNotifications.css';

function PushNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    setPermission(Notification.permission);

    // Check if already subscribed
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
        
        // Show prompt if not subscribed and permission is default
        if (!subscription && Notification.permission === 'default') {
          // Delay showing prompt to avoid annoying users immediately
          setTimeout(() => setShowPrompt(true), 5000);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    } else if (Notification.permission === 'default') {
      setTimeout(() => setShowPrompt(true), 5000);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    if (!base64String) {
      throw new Error('VAPID public key is missing');
    }

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await api.get('/push/vapid-public-key');
      console.log('VAPID key response:', response.data);
      
      if (!response.data || !response.data.publicKey) {
        throw new Error('VAPID public key not received from server. Please ensure VAPID keys are configured in server .env file.');
      }

      const convertedVapidKey = urlBase64ToUint8Array(response.data.publicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to server
      await api.post('/push/subscribe', { subscription });

      setSubscribed(true);
      setShowPrompt(false);
      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Push subscription error:', error);
      
      if (error.message && error.message.includes('VAPID')) {
        toast.error('Server configuration error: ' + error.message);
      } else {
        toast.error('Failed to enable notifications: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
      }

      setSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await api.post('/push/test');
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  return (
    <>
      {/* Notification Permission Prompt - Modal */}
      {showPrompt && permission === 'default' && !subscribed && (
        <div className="notification-prompt">
          <div className="notification-prompt-content">
            <button 
              className="close-prompt-btn"
              onClick={() => setShowPrompt(false)}
            >
              <FiX />
            </button>
            <div className="prompt-icon">
              <FiBell size={40} />
            </div>
            <h3>Stay Updated!</h3>
            <p>Enable notifications to receive instant alerts for messages and calls, even when the app is closed.</p>
            <div className="prompt-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowPrompt(false)}
              >
                Not Now
              </button>
              <button 
                className="btn-primary"
                onClick={subscribeToPush}
                disabled={loading}
              >
                {loading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Settings Icon - Only show when subscribed */}
      {subscribed && (
        <div className="notification-float-icon">
          <button 
            className="float-notification-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Notification Settings"
          >
            <FiBell />
          </button>
        </div>
      )}

      {/* Notification Settings Popup - Only show when clicked */}
      {showSettings && subscribed && (
        <div className="notification-settings-popup">
          <div className="settings-popup-content">
            <div className="settings-header">
              <h4>Push Notifications</h4>
              <button 
                className="close-settings-btn"
                onClick={() => setShowSettings(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="settings-body">
              <div className="setting-status">
                <FiBell className="status-icon active" />
                <div>
                  <p className="status-title">Notifications Enabled</p>
                  <p className="status-desc">You'll receive push notifications for messages and calls</p>
                </div>
              </div>
              <div className="settings-actions">
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    sendTestNotification();
                    setShowSettings(false);
                  }}
                >
                  Test
                </button>
                <button 
                  className="btn-danger btn-sm"
                  onClick={() => {
                    unsubscribeFromPush();
                    setShowSettings(false);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Disabling...' : 'Disable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PushNotifications;
