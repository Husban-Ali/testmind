const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Channel = require('./models/Channel');

dotenv.config({ path: path.join(__dirname, '.env') });

const createCEO = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected\n');

    const existingCEO = await User.findOne({ role: 'ceo' });
    if (existingCEO) {
      console.log(' CEO account already exists!');
      console.log('Username:', existingCEO.username);
      console.log('Email:', existingCEO.email);
      console.log('Password:', existingCEO.plainPassword || 'Check your records');
      process.exit(0);
    }

    let eodChannel = await Channel.findOne({ type: 'eod' });
    if (!eodChannel) {
      console.log('Creating EOD channel...');
      eodChannel = await Channel.create({
        name: 'EOD Reports',
        description: 'Daily End of Day reports from all employees',
        type: 'eod',
        members: [],
        admins: []
      });
      console.log('EOD channel created\n');
    }

    console.log('Creating CEO account...');
    const ceoData = {
      username: 'ceo',
      email: 'ceo@optimars.com',
      password: 'ceo123456',
      firstName: 'Chief',
      lastName: 'Executive',
      role: 'ceo',
      department: 'general',
      isActive: true
    };

    const ceo = await User.create(ceoData);

    if (!eodChannel.members.includes(ceo._id)) {
      eodChannel.members.push(ceo._id);
    }
    if (!eodChannel.admins.includes(ceo._id)) {
      eodChannel.admins.push(ceo._id);
    }
    await eodChannel.save();

    ceo.channels.push(eodChannel._id);
    await ceo.save();

    console.log('\n=================================');
    console.log('✅ CEO Account Created Successfully!');
    console.log('=================================');
    console.log('\n📧 Email:', ceo.email);
    console.log('👤 Username:', ceo.username);
    console.log('🔑 Password:', ceo.plainPassword);
    console.log('👔 Role:', ceo.role);
    console.log('🆔 User ID:', ceo._id);
    console.log('\n=================================');
    console.log('You can now login with these credentials!');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating CEO account:', error.message);
    process.exit(1);
  }
};

createCEO();
