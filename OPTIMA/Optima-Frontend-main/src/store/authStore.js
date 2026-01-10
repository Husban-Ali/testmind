import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';
import locationTracker from '../services/locationTracking';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password, initialLocation = null) => {
    set({ loading: true, error: null });
    try {
      console.log('[AUTH] Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      console.log('[AUTH] ✅ Login successful for:', user.email);
      toast.success(`Welcome back, ${user.firstName}!`);
      
      // Start location tracking after successful login for all non-CEO roles
      const trackedRoles = ['company_manager', 'manager', 'sales_head', 'production_head', 'sales_employee', 'production_employee', 'employee'];
      console.log('[AUTH] User role:', user.role, '| Should track:', trackedRoles.includes(user.role));
      
      if (trackedRoles.includes(user.role)) {
        console.log('[AUTH] Starting location tracking for role:', user.role);
        // If the login form provided an initial location (requested during submit), send it
        if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
          console.log('[AUTH] Sending initial location:', initialLocation);
          try {
            await api.post('/location/update', {
              latitude: initialLocation.latitude,
              longitude: initialLocation.longitude,
              permissionStatus: initialLocation.permissionStatus || 'granted'
            });
          } catch (err) {
            console.error('[AUTH] Failed to save initial location on login:', err?.response?.data || err);
          }
        }

        // Start background tracking (will not prompt if permission was already handled)
        console.log('[AUTH] Calling locationTracker.startTracking()');
        locationTracker.startTracking();
      } else {
        console.log('[AUTH] Role not in tracked roles, skipping location tracking');
      }
      
      return true;
    } catch (error) {
      console.error('[AUTH] ❌ Login failed:', error.response?.data);
      
      // Get specific error message from backend
      let message = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 400) {
        message = 'Please enter valid email and password';
      } else if (!error.response) {
        message = 'Network error. Please check your connection.';
      }
      
      set({ error: message, loading: false });
      // Clear the error after 5 seconds so messages like "Invalid credentials" are transient
      setTimeout(() => set({ error: null }), 5000);
      toast.error(message);
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      toast.error(message);
      return false;
    }
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      set({ user, loading: false });

      // Ensure tracking resumes on refresh for all non-CEO roles
      const trackedRoles = ['company_manager', 'manager', 'sales_head', 'production_head', 'sales_employee', 'production_employee', 'employee'];
      if (trackedRoles.includes(user.role)) {
        locationTracker.startTracking();
      }
    } catch (error) {
      set({ user: null, token: null, loading: false });
      localStorage.removeItem('token');
    }
  },

  logout: async () => {
    try {
      // Stop location tracking before logout
      await locationTracker.onLogout();
      
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    set({ user: null, token: null });
    toast.info('Logged out successfully');
  },

  updateUser: (user) => {
    set({ user });
  }
}));
