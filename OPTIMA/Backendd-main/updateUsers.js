const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// User data with correct names, emails, and passwords
const usersToUpdate = [
  {
    _id: '6924c81911663b717581dfb9',
    username: 'husban',
    email: 'husban@radiantsolutionsrs.com',
    password: 'husban123',
    firstName: 'Husban',
    lastName: ''
  },
  {
    _id: '692de8dc8c5413bf4ac29cd7',
    username: 'waqar',
    email: 'waqar@radiantsolutionsrs.com',
    password: 'waqar123',
    firstName: 'Waqar',
    lastName: ''
  },
  {
    _id: '692df1d08c5413bf4ac29f38',
    username: 'ghazi',
    email: 'ghazi@radiantsolutionsrs.com',
    password: 'ghazi123',
    firstName: 'Ghazi',
    lastName: 'Azhar'
  },
  {
    _id: '692df12d8c5413bf4ac29f31',
    username: 'khuzaima',
    email: 'khuzaima@radiantsolutionsrs.com',
    password: 'khuzaima123',
    firstName: 'Khuzaima',
    lastName: ''
  },
  {
    _id: '692df3408c5413bf4ac29f75',
    username: 'hussain',
    email: 'hussain@radiantsolutionsrs.com',
    password: 'hussain123',
    firstName: 'Hussain',
    lastName: ''
  },
  {
    _id: '692df3fb8c5413bf4ac29fa6',
    username: 'usman',
    email: 'usman@radiantsolutionsrs.com',
    password: 'usman123',
    firstName: 'Usman',
    lastName: ''
  },
  {
    _id: '692df5388c5413bf4ac2a021',
    username: 'daniyal',
    email: 'daniyal@radiantsolutionsrs.com',
    password: 'daniyal123',
    firstName: 'Daniyal',
    lastName: ''
  },
  {
    _id: '692df65c8c5413bf4ac2a15b',
    username: 'sarfaraz',
    email: 'sarfaraz@radiantsolutionsrs.com',
    password: 'sarfaraz123',
    firstName: 'Sarfaraz',
    lastName: ''
  }
];

const updateUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected\n');

    // Define User Schema
    const UserSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      plainPassword: String,
      firstName: String,
      lastName: String,
      role: String,
      department: String
    }, { timestamps: true, strict: false });

    const User = mongoose.model('User', UserSchema);

    console.log('Updating users with correct information...\n');

    for (const userData of usersToUpdate) {
      try {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Update user
        const result = await User.updateOne(
          { _id: userData._id },
          {
            $set: {
              username: userData.username,
              email: userData.email,
              password: hashedPassword,
              plainPassword: userData.password,
              firstName: userData.firstName,
              lastName: userData.lastName
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✓ Updated: ${userData.firstName} ${userData.lastName}`);
          console.log(`  Username: ${userData.username}`);
          console.log(`  Email: ${userData.email}`);
          console.log(`  Password: ${userData.password}\n`);
        } else {
          console.log(`⚠️  No changes for: ${userData.username}\n`);
        }
      } catch (error) {
        console.error(`✗ Error updating ${userData.username}:`, error.message, '\n');
      }
    }

    console.log('=================================');
    console.log('All users updated successfully!');
    console.log('=================================\n');
    console.log('Login Credentials:\n');
    usersToUpdate.forEach(user => {
      console.log(`${user.firstName} ${user.lastName}`.padEnd(20) + ` - ${user.email} - ${user.password}`);
    });
    console.log('\n=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateUsers();
