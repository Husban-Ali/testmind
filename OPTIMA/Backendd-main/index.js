const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require('./socket/socketHandler');

// Load env vars FIRST - with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('[ENV] Environment loaded');
console.log('[ENV] VAPID_PUBLIC_KEY:', process.env.VAPID_PUBLIC_KEY ? 'SET' : 'MISSING');
console.log('[ENV] VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? 'SET' : 'MISSING');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const projectRoutes = require('./routes/projects');
const eodRoutes = require('./routes/eod');
const pushRoutes = require('./routes/push');
const leaveRoutes = require('./routes/leaves');
const profileRoutes = require('./routes/profile');
const attendanceRoutes = require('./routes/attendance');
const locationRoutes = require('./routes/location');

const app = express();
const server = http.createServer(app);

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL === '*' ? '*' : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CLIENT_URL === '*' ? '*' : function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CLIENT_URL === '*' ? false : true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/eod', eodRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/location', locationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO handler
socketHandler(io);

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server, io };
