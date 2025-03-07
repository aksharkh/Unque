const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

describe('College Appointment System - End-to-End Test', function () {
  this.timeout(20000); 

  let studentA1Token, professorP1Token, studentA2Token;
  let professorP1Id, availabilityId1, appointmentIdA1;

  before(async () => {
    console.log("\n--- Connecting to MongoDB ---");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected \n");
  });

  beforeEach(async () => {
    console.log("\n--- Clearing Database ---");
    await Promise.all([
      User.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    console.log("Database Cleared \n");

    console.log("\n--- Registering Users ---");
    await request(app).post('/api/auth/register')
      .send({ email: 'student1@test.com', password: '123456', role: 'student' });
    console.log("✔ Student 1 registered");

    await request(app).post('/api/auth/register')
      .send({ email: 'professor1@test.com', password: '123456', role: 'professor' });
    console.log("✔ Professor 1 registered");

    await request(app).post('/api/auth/register')
      .send({ email: 'student2@test.com', password: '123456', role: 'student' });
    console.log("✔ Student 2 registered\n");

    console.log("\n--- Logging in Users ---");
    let res = await request(app).post('/api/auth/login')
      .send({ email: 'student1@test.com', password: '123456' });
    studentA1Token = res.body.token;
    console.log("✔ Student 1 logged in");

    res = await request(app).post('/api/auth/login')
      .send({ email: 'professor1@test.com', password: '123456' });
    professorP1Token = res.body.token;
    console.log("✔ Professor 1 logged in");

    res = await request(app).post('/api/auth/login')
      .send({ email: 'student2@test.com', password: '123456' });
    studentA2Token = res.body.token;
    console.log("✔ Student 2 logged in\n");


    const professor = await User.findOne({ email: 'professor1@test.com' });
    professorP1Id = professor._id;

    console.log("\n--- Creating Availability Slots ---");
    res = await request(app).post('/api/availability')
      .set('x-auth-token', professorP1Token)
      .send({ startTime: '2023-10-10T09:00:00Z', endTime: '2023-10-10T10:00:00Z' });
    availabilityId1 = res.body._id;
    console.log(`✔ Availability Slot 1 created: ${availabilityId1}`);

    await request(app).post('/api/availability')
      .set('x-auth-token', professorP1Token)
      .send({ startTime: '2023-10-10T11:00:00Z', endTime: '2023-10-10T12:00:00Z' });
    console.log("✔ Availability Slot 2 created\n");
  });

  it('should allow a student to book an appointment and then cancel it', async () => {
    console.log("\n--- Student A1 Fetching Available Slots ---");
    let res = await request(app).get(`/api/availability/${professorP1Id}`)
      .set('x-auth-token', studentA1Token);
    console.log("✔ Available Slots:", res.body);

    console.log("\n--- Student 1 Booking an Appointment ---");
    res = await request(app).post('/api/appointments')
      .set('x-auth-token', studentA1Token)
      .send({ availabilityId: availabilityId1 });
    expect(res.status).to.equal(201);
    appointmentIdA1 = res.body._id;
    console.log(`✔ Appointment booked: ${appointmentIdA1}`);

    console.log("\n--- Professor 1 Cancelling Student 1's Appointment ---");
    res = await request(app).delete(`/api/appointments/${appointmentIdA1}`)
      .set('x-auth-token', professorP1Token);
    expect(res.status).to.equal(200);
    console.log("✔ Appointment canceled successfully\n");

    console.log("\n--- Student 1 Checking Appointments ---");
    res = await request(app).get('/api/appointments')
      .set('x-auth-token', studentA1Token);
    console.log("✔ Final Appointments:", res.body);
    expect(res.body.length).to.equal(0);
  });

  after(async () => {
    console.log("\n--- Disconnecting from MongoDB ---");
    await mongoose.disconnect();
    console.log("MongoDB Disconnected \n");
  });
});
