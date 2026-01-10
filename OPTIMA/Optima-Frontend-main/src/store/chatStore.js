import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';

export const useChatStore = create((set, get) => ({
  channels: [],
  currentChannel: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  loading: false,
  sentMessageIds: new Set(), // Track messages sent by current user to prevent duplicates

  fetchChannels: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/channels');
      set({ channels: response.data.channels, loading: false });
    } catch (error) {
      console.error('Error fetching channels:', error);
      set({ loading: false });
    }
  },

  setCurrentChannel: async (channel) => {
    set({ currentChannel: channel, messages: [], loading: true });
    try {
      const response = await api.get(`/messages/${channel._id}`);
      set({ messages: response.data.messages, loading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },

  sendMessage: async (channelId, content, type = 'text', mentions = [], replyTo = null) => {
    try {
      const payload = {
        channel: channelId,
        content,
        type,
        mentions
      };
      
      if (replyTo) {
        payload.replyTo = replyTo;
      }
      
      const response = await api.post('/messages', payload);
      
      // Immediately add message to UI for the sender (optimistic update)
      // This prevents the delay waiting for socket event
      const newMessage = response.data.message;
      if (newMessage) {
        const currentChannel = get().currentChannel;
        if (currentChannel && String(currentChannel._id) === String(channelId)) {
          console.log('Optimistically adding sender message to UI:', newMessage._id);
          
          // Check if message already exists before adding (safety check)
          const messageExists = get().messages.some(m => m._id === newMessage._id);
          if (!messageExists) {
            set((state) => ({
              messages: [...state.messages, newMessage]
            }));
          }
          
          // Mark that this message was sent by current user to prevent duplicate from socket
          const sentMessages = get().sentMessageIds || new Set();
          sentMessages.add(newMessage._id);
          set({ sentMessageIds: sentMessages });
          
          // Clean up after 5 seconds to prevent memory leak
          setTimeout(() => {
            const currentSentMessages = get().sentMessageIds || new Set();
            currentSentMessages.delete(newMessage._id);
            set({ sentMessageIds: currentSentMessages });
          }, 5000);
        }
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  },

  addMessage: (message) => {
    const currentChannel = get().currentChannel;
    if (currentChannel) {
      // Convert both to strings for reliable comparison
      const messageChannelId = String(message.channel?._id || message.channel || '');
      const currentChannelId = String(currentChannel._id || '');
      
      console.log('addMessage check:', {
        messageChannelId,
        currentChannelId,
        matches: messageChannelId === currentChannelId,
        messageId: message._id,
        message
      });
      
      if (messageChannelId === currentChannelId && messageChannelId !== '') {
        // ALWAYS check if message already exists first (most important check)
        const messageExists = get().messages.some(m => m._id === message._id);
        if (messageExists) {
          console.log('Message already exists in state, skipping duplicate:', message._id);
          return;
        }
        
        // Check if this message was already added by sender (optimistic update)
        const sentMessages = get().sentMessageIds || new Set();
        if (sentMessages.has(message._id)) {
          console.log('Message already added optimistically, skipping socket duplicate');
          // Remove from sentMessages set to free memory
          sentMessages.delete(message._id);
          set({ sentMessageIds: sentMessages });
          return;
        }
        
        console.log('Adding message to state:', message._id);
        set((state) => ({
          messages: [...state.messages, message]
        }));
      }
      // Note: Dashboard.jsx now handles refreshing channels for unread count
    }
  },

  updateMessage: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    }));
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter(msg => msg._id !== messageId)
    }));
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  updateUserStatus: (userId, status) => {
    set((state) => ({
      onlineUsers: status === 'online' 
        ? [...new Set([...state.onlineUsers, userId])]
        : state.onlineUsers.filter(id => id !== userId)
    }));
  },

  setTypingUser: (channelId, userId, username) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [channelId]: { userId, username }
      }
    }));

    // Clear typing after 3 seconds
    setTimeout(() => {
      set((state) => {
        const newTypingUsers = { ...state.typingUsers };
        delete newTypingUsers[channelId];
        return { typingUsers: newTypingUsers };
      });
    }, 3000);
  },

  clearTypingUser: (channelId) => {
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[channelId];
      return { typingUsers: newTypingUsers };
    });
  },

  addChannel: (channel) => {
    set((state) => ({
      channels: [...state.channels, channel]
    }));
  },

  removeChannel: (channelId) => {
    set((state) => {
      // Filter out the deleted channel
      const updatedChannels = state.channels.filter(c => c._id !== channelId);
      
      // If current channel was deleted, clear it
      const newCurrentChannel = state.currentChannel?._id === channelId ? null : state.currentChannel;
      
      return {
        channels: updatedChannels,
        currentChannel: newCurrentChannel,
        messages: newCurrentChannel ? state.messages : []
      };
    });
  }
}));
