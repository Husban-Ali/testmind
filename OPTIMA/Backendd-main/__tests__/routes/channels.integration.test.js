const request = require('supertest');
const { app } = require('../../index');
const Channel = require('../../models/Channel');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Channel Routes Integration Tests', () => {
  let authToken;
  let testUser;
  let channelId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/optima-test');
    }

    // Create test user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'channeltest',
        email: 'channeltest@example.com',
        password: 'password123',
        firstName: 'Channel',
        lastName: 'Test',
        role: 'admin'
      });

    authToken = res.body.token;
    testUser = res.body.user;
  });

  afterAll(async () => {
    await Channel.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/channels', () => {
    it('should create a new channel', async () => {
      const res = await request(app)
        .post('/api/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Channel',
          description: 'A test channel',
          type: 'public'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.channel.name).toBe('Test Channel');
      
      channelId = res.body.channel._id;
    });

    it('should not create channel without auth', async () => {
      const res = await request(app)
        .post('/api/channels')
        .send({
          name: 'Unauthorized Channel',
          type: 'public'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/channels', () => {
    it('should get all channels for user', async () => {
      const res = await request(app)
        .get('/api/channels')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.channels)).toBe(true);
    });
  });

  describe('GET /api/channels/:id', () => {
    it('should get channel by id', async () => {
      const res = await request(app)
        .get(`/api/channels/${channelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.channel._id).toBe(channelId);
    });
  });
});
