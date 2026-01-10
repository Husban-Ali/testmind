import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationDashboard.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationDashboard() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee locations
  const fetchEmployeeLocations = async () => {
    try {
      const response = await api.get('/location/ceo/employee-locations');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employee locations:', err);
      setError('Failed to load employee locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeLocations();

    // Refresh every 30 seconds
    const interval = setInterval(fetchEmployeeLocations, 30000);

    return () => clearInterval(interval);
  }, []);

  const hasCoords = (employee) => employee.latitude !== null && employee.longitude !== null;

  const handleViewLocation = (employee) => {
    if (employee.locationEnabled && hasCoords(employee)) {
      setSelectedEmployee(employee);
    }
  };

  const handleCloseMap = () => {
    setSelectedEmployee(null);
  };

  const getLocationStatus = (employee) => {
    if (employee.status === 'offline') {
      return { text: 'Offline', className: 'status-offline' };
    }
    
    if (employee.permissionStatus === 'denied' || employee.permissionStatus === 'blocked') {
      return { text: 'Permission Denied', className: 'status-denied' };
    }
    
    if (employee.locationEnabled) {
      return { text: 'Live', className: 'status-live' };
    }
    
    return { text: 'Unknown', className: 'status-unknown' };
  };

  const formatLastUpdated = (lastUpdated) => {
    if (!lastUpdated) return 'Never';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="location-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading employee locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchEmployeeLocations} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="location-dashboard">
      <div className="dashboard-header">
        <h2>Employee Location Tracking</h2>
        <button onClick={fetchEmployeeLocations} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="employee-list">
        <table className="employee-table">
          <thead>
            <tr>
              <th style={{ display: 'none' }}>Employee ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Location Status</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const locationStatus = getLocationStatus(employee);
              const canViewLocation = employee.locationEnabled &&
                                      hasCoords(employee) &&
                                      employee.permissionStatus !== 'denied' &&
                                      employee.permissionStatus !== 'blocked';

              return (
                <tr key={employee.employeeId}>
                  <td style={{ display: 'none' }}>{employee.employeeId}</td>
                  <td>{employee.name}</td>
                  <td>
                    <span className={`status-badge ${employee.status === 'online' ? 'online' : 'offline'}`}>
                      {employee.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${locationStatus.className}`}>
                      {locationStatus.text}
                    </span>
                  </td>
                  <td>{formatLastUpdated(employee.lastUpdated)}</td>
                  <td>
                    <button
                      className="btn-view-location"
                      onClick={() => handleViewLocation(employee)}
                      disabled={!canViewLocation}
                    >
                      {canViewLocation ? '📍 View Location' : '🚫 Unavailable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="no-employees">
            <p>No employees found</p>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {selectedEmployee && (
        <div className="map-modal">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <h3>{selectedEmployee.name}'s Location</h3>
              <button onClick={handleCloseMap} className="btn-close">
                ✕
              </button>
            </div>
            <div className="map-container">
              <MapContainer
                center={[selectedEmployee.latitude, selectedEmployee.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[selectedEmployee.latitude, selectedEmployee.longitude]}>
                  <Popup>
                    <strong>{selectedEmployee.name}</strong>
                    <br />
                    Employee is here
                    <br />
                    <small>Last updated: {formatLastUpdated(selectedEmployee.lastUpdated)}</small>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="map-info">
              <p>
                <strong>Coordinates:</strong> {selectedEmployee.latitude.toFixed(6)}, {selectedEmployee.longitude.toFixed(6)}
              </p>
              <p>
                <strong>Last Updated:</strong> {formatLastUpdated(selectedEmployee.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationDashboard;
