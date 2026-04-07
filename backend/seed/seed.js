const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();

// Override DNS to fix ISP blocking SRV lookups
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const User = require('../models/User');
const Department = require('../models/Department');
const { Program, Semester } = require('../models/Program');
const Course = require('../models/Course');
const { ProgramOutcome, CourseOutcome } = require('../models/Outcome');
const Mapping = require('../models/Mapping');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Approval = require('../models/Approval');
const CurriculumVersion = require('../models/CurriculumVersion');

async function seed() {
  console.log('🌱 Starting ACMS MongoDB database seed...\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}), Program.deleteMany({}), Semester.deleteMany({}),
      Course.deleteMany({}), ProgramOutcome.deleteMany({}), CourseOutcome.deleteMany({}), Mapping.deleteMany({}),
      ActivityLog.deleteMany({}), Notification.deleteMany({}), Approval.deleteMany({}), CurriculumVersion.deleteMany({})
    ]);

    const adminHash = await bcrypt.hash('Admin@123', 12);
    const facultyHash = await bcrypt.hash('Faculty@123', 12);
    
    // Departments
    const dept = new Department({ name: 'Computer Science & Engineering', code: 'CSE' });
    await dept.save();
    console.log('✅ Department created');

    // Users
    const admin = new User({ name: 'System Admin', email: 'admin@acms.edu', password_hash: adminHash, role: 'admin', department_id: dept._id });
    const faculty = new User({ name: 'Prof. Suresh Nair', email: 'faculty@acms.edu', password_hash: facultyHash, role: 'faculty', department_id: dept._id });
    await Promise.all([admin.save(), faculty.save()]);
    console.log('✅ Users created');

    // Program & Semesters
    const prog = new Program({ name: 'B.Tech in Computer Science', code: 'BTECH-CSE', department_id: dept._id, duration_years: 4, description: 'Undergraduate CSE' });
    await prog.save();
    
    const sems = [];
    for (let i = 1; i <= 8; i++) {
        sems.push({ program_id: prog._id, number: i, label: `Semester ${i}` });
    }
    const insertedSems = await Semester.insertMany(sems);
    console.log('✅ Program & Semesters created');

    // Courses
    const c1 = new Course({ code: 'CS101', name: 'Intro to Programming', credits: 4, semester_id: insertedSems[0]._id, faculty_id: faculty._id, description: 'Basics of C' });
    const c2 = new Course({ code: 'CS201', name: 'Data Structures', credits: 4, semester_id: insertedSems[1]._id, faculty_id: faculty._id, description: 'Arrays, Trees' });
    await Promise.all([c1.save(), c2.save()]);
    console.log('✅ Courses created');

    // POs
    const po1 = new ProgramOutcome({ program_id: prog._id, code: 'PO1', description: 'Engineering Knowledge: Apply math and science' });
    const po2 = new ProgramOutcome({ program_id: prog._id, code: 'PO2', description: 'Problem Analysis: Identify engineering problems' });
    await Promise.all([po1.save(), po2.save()]);
    console.log('✅ Program Outcomes created');

    // COs and Mappings
    const co1 = new CourseOutcome({ course_id: c1._id, code: 'CO1', description: 'Understand C fundamentals' });
    const co2 = new CourseOutcome({ course_id: c1._id, code: 'CO2', description: 'Write basic algorithms' });
    await Promise.all([co1.save(), co2.save()]);

    await Mapping.insertMany([
      { co_id: co1._id, po_id: po1._id, correlation_level: 3, mapped_by: faculty._id },
      { co_id: co2._id, po_id: po2._id, correlation_level: 2, mapped_by: faculty._id }
    ]);
    console.log('✅ Course Outcomes & Mappings created');
    
    // Activity Logs
    await ActivityLog.insertMany([
        { user_id: admin._id, user_name: admin.name, user_role: 'admin', action: 'SYSTEM_INIT', entity_type: 'System', details: 'Initial bootstrap' }
    ]);

    // Notifications
    await Notification.insertMany([
        { recipient_id: admin._id, type: 'SYSTEM', title: 'Welcome to ACMS', message: 'Your Admin account has been activated.' },
        { recipient_id: faculty._id, type: 'COURSE_ASSIGNED', title: 'New Course Assigned', message: 'You have been assigned to teach Intro to Programming (CS101).', link: '/faculty/courses' }
    ]);

    // Approvals
    await Approval.create({
        title: 'Update CS101 Syllabus',
        description: 'Adding Python module to unit 5',
        type: 'SYLLABUS_UPDATE',
        status: 'pending',
        submitted_by: faculty._id,
        course_id: c1._id,
        program_id: prog._id,
        department_id: dept._id,
        submitted_at: new Date()
    });

    // Curriculum Versions
    await CurriculumVersion.create({
        course_id: c1._id,
        version_number: 1,
        academic_year: '2024-2025',
        modified_by: admin._id,
        modified_by_name: admin.name,
        change_summary: 'Initial course definition',
        snapshot: { name: c1.name, code: c1.code, credits: c1.credits, description: c1.description }
    });

    console.log('✅ Activity Logs, Notifications, Approvals, & Versions created');

    console.log('\n✅ ====== MONGODB SEED COMPLETE ======');
    console.log('\n📋 Default Login Credentials:');
    console.log('│  Admin    │ admin@acms.edu     │ Admin@123          │');
    console.log('│  Faculty  │ faculty@acms.edu   │ Faculty@123        │\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
