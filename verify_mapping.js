const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./backend/models/Course');
const { CourseOutcome } = require('./backend/models/Outcome');

async function verify() {
  console.log('--- BACKEND VERIFICATION START ---');
  console.log('Connecting to:', process.env.MONGO_URI?.split('@')[1]); // Log host only for safety

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1. Database connection: SUCCESS');

    const course = await Course.findOne();
    if (!course) {
      console.log('2. Course check: FAILED (No courses found in database)');
      process.exit(1);
    }
    console.log('2. Found test Course:', course.name, '(', course._id, ')');

    const testCO = new CourseOutcome({
      course_id: course._id,
      code: 'DEBUG-' + Date.now(),
      description: 'System-generated verification outcome'
    });

    await testCO.save();
    console.log('3. Model Creation & Save: SUCCESS');

    await CourseOutcome.deleteOne({ _id: testCO._id });
    console.log('4. Cleanup: SUCCESS');

    console.log('--- ALL BACKEND CHECKS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('--- VERIFICATION FAILED ---');
    console.error('Error Type:', err.constructor.name);
    console.error('Error Message:', err.message);
    if (err.errors) console.error('Validation Errors:', JSON.stringify(err.errors));
    process.exit(1);
  }
}

verify();
