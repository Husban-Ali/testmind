const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    fixEmployeeIds();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixEmployeeIds() {
  try {
    console.log('Starting employeeId fix...');

    // Find all users with empty string employeeId
    const usersWithEmptyId = await User.find({ employeeId: '' });
    console.log(`Found ${usersWithEmptyId.length} users with empty employeeId`);

    // Update each user to have undefined employeeId
    for (const user of usersWithEmptyId) {
      user.employeeId = undefined;
      await user.save();
      console.log(`✅ Fixed user: ${user.username} (${user.email})`);
    }

    console.log('\n✅ All users fixed successfully!');
    console.log('\nNow you can safely restart the server.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing employeeId:', error);
    process.exit(1);
  }
}
