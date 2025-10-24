import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mom_portal';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'Admin',
      mobileNo: '1234567890',
      isActive: true
    });

    await adminUser.save();
    console.log('Default admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: Admin');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Create additional test users
const createTestUsers = async () => {
  try {
    const testUsers = [
      {
        name: 'Convener',
        email: 'convener@example.com',
        password: 'convener123',
        role: 'Convener',
        mobileNo: '1234567891',
        isActive: true
      },
      {
        name: 'Staff Member',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'Staff',
        mobileNo: '1234567892',
        isActive: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User ${userData.email} already exists`);
      }
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  }
};

// Main initialization function
const initializeDatabase = async () => {
  await connectDB();
  await createDefaultAdmin();
  await createTestUsers();
  
  console.log('\n=== Database Initialization Complete ===');
  console.log('Test Users Created:');
  console.log('1. Admin User:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('   Role: Admin');
  console.log('\n2. Convener:');
  console.log('   Email: convener@example.com');
  console.log('   Password: convener123');
  console.log('   Role: Convener');
  console.log('\n3. Staff Member:');
  console.log('   Email: staff@example.com');
  console.log('   Password: staff123');
  console.log('   Role: Staff');
  console.log('\nYou can now test the login functionality!');
  console.log('\nAPI Endpoints:');
  console.log('POST http://localhost:8800/api/auth/login');
  console.log('POST http://localhost:8800/api/auth/register');
  console.log('GET  http://localhost:8800/api/auth/profile (requires token)');
  
  process.exit(0);
};

// Run initialization
initializeDatabase().catch(console.error);
