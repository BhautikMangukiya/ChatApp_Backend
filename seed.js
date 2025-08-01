// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("🔄 Seeding...");

  await User.deleteMany({});

  await User.insertMany([
    { username: "Jay", password: "1234" },
    { username: "Bhautik", password: "1234" }
  ]);

  console.log("✅ Users inserted.");
  process.exit();
});
