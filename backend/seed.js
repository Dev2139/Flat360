const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Flat = require('./models/Flat');
const crypto = require('crypto');

dotenv.config();

const seedData = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flat360';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // 1. Seed Admin User
    const userExists = await User.findOne({ username: 'admin' });
    if (!userExists) {
      await User.create({
        name: 'Head Security',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created! (admin/admin123)');
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Seed Flats
    const flatCount = await Flat.countDocuments();
    if (flatCount === 0) {
      const sampleFlats = [
        { flatNumber: '101', ownerName: 'John Doe', ownerPhone: '+919876543210' },
        { flatNumber: '102', ownerName: 'Jane Smith', ownerPhone: '+918765432109' },
        { flatNumber: '201', ownerName: 'Robert Johnson', ownerPhone: '+917654321098' },
        { flatNumber: '202', ownerName: 'Emily Davis', ownerPhone: '+916543210987' },
        { flatNumber: '301', ownerName: 'Michael Brown', ownerPhone: '+915432109876' },
        { flatNumber: '302', ownerName: 'Sarah Wilson', ownerPhone: '+914321098765' }
      ];

      for (const flat of sampleFlats) {
        const qrCodeId = `flat_${flat.flatNumber}_${crypto.randomBytes(4).toString('hex')}`;
        await Flat.create({
          ...flat,
          qrCodeId
        });
      }
      console.log('Sample flats seeded successfully!');
    } else {
      console.log('Flats already exist in database.');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
