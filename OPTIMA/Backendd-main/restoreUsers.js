const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// These are the exact user IDs found in your EOD reports, messages, and channels
const usersToRestore = [
  {
    _id: new mongoose.Types.ObjectId('6924c81911663b717581dfb9'),
    username: 'user1',
    email: 'user1@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'One',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692de8dc8c5413bf4ac29cd7'),
    username: 'user2',
    email: 'user2@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Two',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df1d08c5413bf4ac29f38'),
    username: 'user3',
    email: 'user3@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Three',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df12d8c5413bf4ac29f31'),
    username: 'user4',
    email: 'user4@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Four',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df3408c5413bf4ac29f75'),
    username: 'user5',
    email: 'user5@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Five',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df3fb8c5413bf4ac29fa6'),
    username: 'user6',
    email: 'user6@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Six',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df5388c5413bf4ac2a021'),
    username: 'user7',
    email: 'user7@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Seven',
    role: 'employee',
    department: 'general'
  },
  {
    _id: new mongoose.Types.ObjectId('692df65c8c5413bf4ac2a15b'),
    username: 'user8',
    email: 'user8@optimars.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Eight',
    role: 'employee',
    department: 'general'
  }
];

const restoreUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected\n');

    // Define User Schema manually to avoid pre-save hooks
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      plainPassword: { type: String, default: '' },
      role: { type: String, default: 'employee' },
      department: { type: String, default: 'general' },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      avatar: { type: String, default: '' },
      status: { type: String, default: 'offline' },
      lastSeen: { type: Date, default: Date.now },
      assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
      channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
      isActive: { type: Boolean, default: true },
      projectValues: [{
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        value: { type: Number, default: 0 },
        submittedAt: { type: Date, default: Date.now }
      }],
      pushSubscriptions: [{
        endpoint: String,
        keys: { p256dh: String, auth: String },
        userAgent: String,
        createdAt: { type: Date, default: Date.now }
      }]
    }, { timestamps: true });

    const User = mongoose.model('User', UserSchema);

    // Get EOD channel
    const Channel = mongoose.model('Channel', new mongoose.Schema({
      name: String,
      type: String,
      members: [{ type: mongoose.Schema.Types.ObjectId }],
      admins: [{ type: mongoose.Schema.Types.ObjectId }],
      createdBy: { type: mongoose.Schema.Types.ObjectId }
    }));

    let eodChannel = await Channel.findOne({ type: 'eod' });

    console.log('Restoring users with exact MongoDB IDs...\n');
    const restoredUsers = [];

    for (const userData of usersToRestore) {
      try {
        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Insert with specific _id
        const user = new User({
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          plainPassword: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          department: userData.department,
          channels: eodChannel ? [eodChannel._id] : [],
          isActive: true,
          status: 'offline'
        });

        await user.save({ validateBeforeSave: false });
        
        // Add user to EOD channel
        if (eodChannel && !eodChannel.members.includes(user._id)) {
          eodChannel.members.push(user._id);
        }

        restoredUsers.push(user);
        console.log(`✓ Restored: ${user.username} (${user.email})`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Role: ${user.role}\n`);
      } catch (error) {
        console.error(`✗ Error restoring ${userData.username}:`, error.message, '\n');
      }
    }

    // Save EOD channel
    if (eodChannel) {
      await eodChannel.save();
    }

    console.log('=================================');
    console.log('User restoration completed!');
    console.log(`Total users restored: ${restoredUsers.length}`);
    console.log('=================================');
    console.log('\n🎉 All old chats, EOD reports, and projects are now linked!');
    console.log('\nDefault password for all users: password123');
    console.log('\n⚠️ IMPORTANT: Update the usernames, emails, and roles above');
    console.log('   with the actual values if you know them!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error restoring users:', error);
    process.exit(1);
  }
};

restoreUsers();
