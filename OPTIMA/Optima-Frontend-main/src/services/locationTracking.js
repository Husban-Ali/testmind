// Location tracking service - runs in background for employees
class LocationTrackingService {
  constructor() {
    this.trackingInterval = null;
    this.watchId = null;
    this.isTracking = false;
    this.updateIntervalMs = 3 * 60 * 1000; // 3 minutes
    this.focusListenerAttached = false;
    this.handleFocus = this.handleFocus.bind(this);
  }

  // Request location permission and start tracking
  async startTracking() {
    if (this.isTracking) {
      console.log('[LocationTracker] Already tracking');
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('[LocationTracker] Geolocation not supported');
      this.notifyPermissionDenied();
      return;
    }

    try {
      // Request permission with a custom message through the browser API
      const position = await this.requestLocationPermission();
      
      console.log('[LocationTracker] Permission granted');
      this.isTracking = true;

      // Attach focus listener to refresh location when user returns to the tab/app
      this.attachFocusListener();

      // Send initial location
      await this.sendLocationUpdate(position.coords.latitude, position.coords.longitude, 'granted');

      // Start periodic updates
      this.startPeriodicUpdates();
    } catch (error) {
      console.log('[LocationTracker] Permission denied or error:', error);
      this.notifyPermissionDenied();
    }
  }

  // Request location permission (this triggers browser's permission dialog)
  requestLocationPermission() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.log('[LocationTracker] Geolocation error:', error.code, error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }

  // Start sending location updates every 2-5 minutes
  startPeriodicUpdates() {
    // Clear any existing interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(async () => {
      try {
        const position = await this.getCurrentPosition();
        await this.sendLocationUpdate(
          position.coords.latitude,
          position.coords.longitude,
          'granted'
        );
        console.log('[LocationTracker] Location updated');
      } catch (error) {
        console.error('[LocationTracker] Failed to get location:', error);
        // If permission is revoked, notify backend
        if (error.code === 1) { // PERMISSION_DENIED
          this.notifyPermissionDenied();
          this.stopTracking();
        }
      }
    }, this.updateIntervalMs);
  }

  // Refresh once on focus to prevent users showing offline after long inactivity
  async handleFocus() {
    if (!this.isTracking) return;
    try {
      const position = await this.getCurrentPosition();
      await this.sendLocationUpdate(position.coords.latitude, position.coords.longitude, 'granted');
      console.log('[LocationTracker] Focus refresh sent');
    } catch (error) {
      console.error('[LocationTracker] Focus refresh failed:', error);
    }
  }

  attachFocusListener() {
    if (this.focusListenerAttached || typeof window === 'undefined') return;
    window.addEventListener('focus', this.handleFocus);
    this.focusListenerAttached = true;
  }

  detachFocusListener() {
    if (!this.focusListenerAttached || typeof window === 'undefined') return;
    window.removeEventListener('focus', this.handleFocus);
    this.focusListenerAttached = false;
  }

  // Get current position
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[LocationTracker] Got position:', { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
          resolve(position);
        },
        (error) => {
          console.error('[LocationTracker] Position error:', error.code, error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Always get fresh position for best accuracy
        }
      );
    });
  }

  // Send location update to backend
  async sendLocationUpdate(latitude, longitude, permissionStatus) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[LocationTracker] No token found, stopping tracking');
        this.stopTracking();
        return;
      }

      // Validate coordinates are valid numbers
      if (permissionStatus === 'granted' && (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude))) {
        console.error('[LocationTracker] Invalid coordinates:', { latitude, longitude });
        return;
      }

      console.log('[LocationTracker] Sending location update:', { latitude, longitude, permissionStatus });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude,
          longitude,
          permissionStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[LocationTracker] Failed to update location:', response.status, errorData);
        console.error('[LocationTracker] Sent data was:', { latitude, longitude, permissionStatus });
      } else {
        const data = await response.json();
        console.log('[LocationTracker] ✅ Location update successful:', data);
      }
    } catch (error) {
      console.error('[LocationTracker] Error sending location update:', error);
    }
  }

  // Notify backend that permission was denied
  async notifyPermissionDenied() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          permissionStatus: 'denied'
        })
      });

      if (!response.ok) {
        console.error('[LocationTracker] Failed to notify permission denied:', response.status);
      }
    } catch (error) {
      console.error('[LocationTracker] Error notifying permission denied:', error);
    }
  }

  // Stop tracking
  stopTracking() {
    console.log('[LocationTracker] Stopping tracking');
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;

    // Remove focus listener when stopping tracking
    this.detachFocusListener();
  }

  // Called on logout
  async onLogout() {
    this.stopTracking();
    
    // Notify backend that user is logging out
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/location/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('[LocationTracker] Error on logout:', error);
    }
  }
}

// Create a singleton instance
const locationTracker = new LocationTrackingService();

export default locationTracker;
