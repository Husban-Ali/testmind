const express = require('express');
const router = express.Router();
const UserLocation = require('../models/UserLocation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/location/update - Update employee location
router.post('/update', protect, async (req, res) => {
  try {
    const { latitude, longitude, permissionStatus } = req.body;
    const userId = req.user._id;

    // Validate permission status
    if (!permissionStatus || !['granted', 'denied', 'blocked'].includes(permissionStatus)) {
      return res.status(400).json({ message: 'Invalid permission status' });
    }

    const updateData = {
      userId,
      isOnline: true,
      permissionStatus,
      lastUpdated: new Date()
    };

    // If permission is granted, expect and store coordinates
    if (permissionStatus === 'granted') {
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Latitude and longitude required when permission is granted' });
      }
      updateData.latitude = latitude;
      updateData.longitude = longitude;
      updateData.locationEnabled = true;
    } else {
      // Permission denied or blocked
      updateData.latitude = null;
      updateData.longitude = null;
      updateData.locationEnabled = false;
    }

    // Upsert the location data
    const location = await UserLocation.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync User.status based on location
    try {
      await User.findByIdAndUpdate(userId, {
        status: updateData.isOnline ? 'online' : 'offline',
        lastSeen: new Date()
      });
    } catch (err) {
      console.error('Failed to update User.status from location update:', err);
    }

    // Emit socket events to update online lists in real-time
    try {
      const io = req.app.get('io');
      if (io) {
        // Emit single user status change
        io.emit('user:status', {
          userId: userId.toString(),
          status: updateData.isOnline ? 'online' : 'offline',
          lastUpdated: location.lastUpdated
        });

        // Emit updated online users list (based on recent location updates)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const onlineLocations = await UserLocation.find({
          isOnline: true,
          lastUpdated: { $gt: tenMinutesAgo }
        }).select('userId');
        const onlineUserIds = onlineLocations.map(l => l.userId.toString());
        io.emit('users:online', onlineUserIds);
      }
    } catch (err) {
      console.error('Failed to emit socket events from location update:', err);
    }

    res.json({ 
      message: 'Location updated successfully',
      locationEnabled: location.locationEnabled
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ceo/employee-locations - CEO can view all non-CEO locations
router.get('/ceo/employee-locations', protect, async (req, res) => {
  try {
    // Only CEO / co-CEO can view everyone else's locations
    const allowedRoles = ['ceo', 'co_ceo'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only CEO can view all locations.' });
    }

    // Get all users except CEOs (includes managers, heads, employees)
    const employees = await User.find({ 
      role: { $nin: ['ceo', 'co_ceo'] } 
    }).select('_id employeeId firstName lastName name role');

    // Get location data for all employees
    const locations = await UserLocation.find({
      userId: { $in: employees.map(e => e._id) }
    });

    // Create a map for quick lookup
    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.userId.toString()] = loc;
    });

    // Mark locations as offline if not updated in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Combine employee and location data
    const employeeLocations = employees.map(employee => {
      const location = locationMap[employee._id.toString()];
      
      // Get employee name - use name field if available, else combine firstName and lastName
      const empName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
      const empId = employee.employeeId || employee._id.toString();
      
      if (!location) {
        // No location data yet
        return {
          employeeId: empId,
          name: empName,
          status: 'offline',
          permissionStatus: 'prompt',
          locationEnabled: false,
          latitude: null,
          longitude: null,
          lastUpdated: null
        };
      }

      // Check if location is stale (older than 10 minutes)
      const isOnline = location.isOnline && location.lastUpdated > tenMinutesAgo;
      // Check if valid coordinates exist - trust coordinates over locationEnabled flag
      const hasValidCoords = location.latitude !== null && location.longitude !== null && 
                            !isNaN(location.latitude) && !isNaN(location.longitude);

      return {
        employeeId: empId,
        name: empName,
        status: isOnline ? 'online' : 'offline',
        permissionStatus: location.permissionStatus,
        // Return locationEnabled as true if valid coordinates exist
        locationEnabled: hasValidCoords,
        latitude: hasValidCoords ? location.latitude : null,
        longitude: hasValidCoords ? location.longitude : null,
        lastUpdated: location.lastUpdated
      };
    });

    res.json(employeeLocations);
  } catch (error) {
    console.error('Get employee locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/location/logout - Set user offline on logout
router.post('/logout', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    await UserLocation.findOneAndUpdate(
      { userId },
      { 
        isOnline: false,
        lastUpdated: new Date()
      }
    );

    // Also mark User as offline and emit
    try {
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('user:status', { userId: userId.toString(), status: 'offline', lastUpdated: new Date() });

        // Update online users list
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const onlineLocations = await UserLocation.find({
          isOnline: true,
          lastUpdated: { $gt: tenMinutesAgo }
        }).select('userId');
        const onlineUserIds = onlineLocations.map(l => l.userId.toString());
        io.emit('users:online', onlineUserIds);
      }
    } catch (err) {
      console.error('Failed to update User.status or emit on location logout:', err);
    }

    res.json({ message: 'User set to offline' });
  } catch (error) {
    console.error('Location logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
