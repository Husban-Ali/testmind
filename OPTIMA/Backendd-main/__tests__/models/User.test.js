const User = require('../models/User');

describe('User Model', () => {
  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await user.save();
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await user.save();
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('getPublicProfile', () => {
    it('should not include password in public profile', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await user.save();
      const publicProfile = user.getPublicProfile();
      expect(publicProfile.password).toBeUndefined();
      expect(publicProfile.email).toBe('test@test.com');
    });
  });
});
