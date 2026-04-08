const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');
const { Program } = require('./backend/models/Program');

async function checkDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- DB Check ---');
  const users = await User.find().lean();
  console.log('Users:', users.length);
  users.forEach(u => console.log(`- ${u.name} (${u.role}) ID: ${u._id}`));

  const programs = await Program.find().lean();
  console.log('Programs:', programs.length);
  programs.forEach(p => console.log(`- ${p.name} (${p.code}) ID: ${p._id}`));

  await mongoose.disconnect();
}

checkDB();
