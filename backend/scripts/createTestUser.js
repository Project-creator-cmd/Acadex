require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@acadex.com' });
    if (existingUser) {
      console.log('❌ Test user already exists');
      process.exit(0);
    }

    // Create test users
    const users = [
      {
        name: 'Test Student',
        email: 'student@acadex.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2024001',
        batch: '2024'
      },
      {
        name: 'Test Faculty',
        email: 'faculty@acadex.com',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science'
      },
      {
        name: 'Test Admin',
        email: 'admin@acadex.com',
        password: 'password123',
        role: 'admin',
        department: 'Administration'
      }
    ];

    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n📝 Test Credentials:');
    console.log('Student: student@acadex.com / password123');
    console.log('Faculty: faculty@acadex.com / password123');
    console.log('Admin: admin@acadex.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
