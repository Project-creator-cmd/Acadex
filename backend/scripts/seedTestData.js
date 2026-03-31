require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  // Find or create test users
  let student = await User.findOne({ email: 'student@acadex.com' });
  let faculty = await User.findOne({ email: 'faculty@acadex.com' });
  let admin   = await User.findOne({ email: 'admin@acadex.com' });

  if (!student) {
    student = await User.create({
      name: 'Test Student', email: 'student@acadex.com',
      password: 'password123', role: 'student',
      department: 'Computer Science', rollNumber: 'CS2024001', batch: '2024'
    });
    console.log('✅ Created student');
  }

  if (!faculty) {
    faculty = await User.create({
      name: 'Test Faculty', email: 'faculty@acadex.com',
      password: 'password123', role: 'faculty',
      department: 'Computer Science'
    });
    console.log('✅ Created faculty');
  }

  if (!admin) {
    admin = await User.create({
      name: 'Test Admin', email: 'admin@acadex.com',
      password: 'password123', role: 'admin',
      department: 'Administration'
    });
    console.log('✅ Created admin');
  }

  // Create a pending achievement for the student
  const existing = await Achievement.findOne({ userId: student._id, status: 'pending' });
  if (!existing) {
    await Achievement.create({
      userId: student._id,
      title: 'Smart India Hackathon 2024 - Winner',
      type: 'winner',
      level: 'national',
      organizer: 'Ministry of Education',
      date: new Date('2024-03-15'),
      description: 'Won first place in SIH 2024',
      file_url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      status: 'pending',
      department: 'Computer Science'
    });
    console.log('✅ Created pending achievement for student');
  }

  console.log('\n📝 Test Credentials:');
  console.log('  Student : student@acadex.com / password123');
  console.log('  Faculty : faculty@acadex.com / password123  (dept: Computer Science)');
  console.log('  Admin   : admin@acadex.com   / password123');
  console.log('\n✅ Faculty should now see 1 pending achievement on Verify page');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
