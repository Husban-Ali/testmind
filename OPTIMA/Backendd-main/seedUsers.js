const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Channel = require('./models/Channel');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const sampleUsers = [
  {
    username: 'ceo_user',
    email: 'ceo@optimars.com',
    password: 'password123',
    firstName: 'CEO',
    lastName: 'Admin',
    role: 'ceo',
    department: 'general'
  },
  {
    username: 'coceo_user',
    email: 'coceo@optimars.com',
    password: 'password123',
    firstName: 'Co-CEO',
    lastName: 'Admin',
    role: 'co_ceo',
    department: 'general'
  },
  {
    username: 'manager_user',
    email: 'manager@optimars.com',
    password: 'password123',
    firstName: 'Company',
    lastName: 'Manager',
    role: 'company_manager',
    department: 'general'
  },
  {
    username: 'sales_head',
    email: 'saleshead@optimars.com',
    password: 'password123',
    firstName: 'Sales',
    lastName: 'Head',
    role: 'sales_head',
    department: 'sales'
  },
  {
    username: 'sales_emp1',
    email: 'sales1@optimars.com',
    password: 'password123',
    firstName: 'Sales',
    lastName: 'Employee 1',
    role: 'sales_employee',
    department: 'sales'
  },
  {
    username: 'sales_emp2',
    email: 'sales2@optimars.com',
    password: 'password123',
    firstName: 'Sales',
    lastName: 'Employee 2',
    role: 'sales_employee',
    department: 'sales'
  },
  {
    username: 'prod_head',
    email: 'prodhead@optimars.com',
    password: 'password123',
    firstName: 'Production',
    lastName: 'Head',
    role: 'production_head',
    department: 'production'
  },
  {
    username: 'prod_emp1',
    email: 'prod1@optimars.com',
    password: 'password123',
    firstName: 'Production',
    lastName: 'Employee 1',
    role: 'production_employee',
    department: 'production'
  },
  {
    username: 'prod_emp2',
    email: 'prod2@optimars.com',
    password: 'password123',
    firstName: 'Production',
    lastName: 'Employee 2',
    role: 'production_employee',
    department: 'production'
  },
  {
    username: 'employee1',
    email: 'employee1@optimars.com',
    password: 'password123',
    firstName: 'General',
    lastName: 'Employee 1',
    role: 'employee',
    department: 'general'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing users. Do you want to clear them? (This script will continue anyway)`);
    }

    // Create users first
    console.log('\nCreating users...');
    const createdUsers = [];
    
    // Find or create the first CEO user to use as channel creator
    let ceoUser = await User.findOne({ role: 'ceo' });
    if (!ceoUser) {
      ceoUser = await User.create(sampleUsers[0]);
      console.log(`✓ Created user: ${ceoUser.username} (${ceoUser.email}) - Role: ${ceoUser.role}`);
      createdUsers.push(ceoUser);
    } else {
      createdUsers.push(ceoUser);
    }

    // Create EOD channel with CEO as creator
    let eodChannel = await Channel.findOne({ type: 'eod' });
    if (!eodChannel) {
      console.log('Creating EOD channel...');
      eodChannel = await Channel.create({
        name: 'EOD Reports',
        description: 'Daily End of Day reports from all employees',
        type: 'eod',
        createdBy: ceoUser._id,
        members: [ceoUser._id],
        admins: [ceoUser._id]
      });
      console.log('EOD channel created');
    }
    
    for (const userData of sampleUsers) {
      try {
        // Skip if this is the CEO user we already created
        if (userData.role === 'ceo' && createdUsers.some(u => u.email === userData.email)) {
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [{ email: userData.email }, { username: userData.username }] 
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.username} already exists, skipping...`);
          // Assign employeeId if not already set
          if (!existingUser.employeeId) {
            existingUser.employeeId = `EMP${createdUsers.length.toString().padStart(4, '0')}`;
            await existingUser.save();
          }
          createdUsers.push(existingUser);
          continue;
        }

        const user = await User.create(userData);
        
        // Assign employeeId if not a manager/CEO
        if (!['ceo', 'co_ceo', 'company_manager'].includes(user.role)) {
          user.employeeId = `EMP${createdUsers.length.toString().padStart(4, '0')}`;
        }
        
        // Add user to EOD channel
        if (!eodChannel.members.includes(user._id)) {
          eodChannel.members.push(user._id);
        }
        
        // Add channel to user
        user.channels.push(eodChannel._id);
        await user.save();
        
        createdUsers.push(user);
        console.log(`✓ Created user: ${user.username} (${user.email}) - Role: ${user.role}${user.employeeId ? ` - ID: ${user.employeeId}` : ''}`);
      } catch (error) {
        console.error(`✗ Error creating user ${userData.username}:`, error.message);
      }
    }

    // Save EOD channel with all members
    await eodChannel.save();

    console.log('\n=================================');
    console.log('Database seeding completed!');
    console.log(`Total users created/found: ${createdUsers.length}`);
    console.log('=================================');
    console.log('\nLogin credentials for all users:');
    console.log('Password for all: password123\n');
    sampleUsers.forEach(user => {
      console.log(`${user.role.padEnd(20)} - ${user.email}`);
    });
    console.log('\n=================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
