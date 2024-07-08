const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/config');
const User = require('../models/user');
const Organisation = require('../models/organisation');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Authentication', () => {
  it('should register user successfully with default organisation', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.firstName).toBe('John');
    expect(res.body.data.user.lastName).toBe('Doe');
    expect(res.body.data.user.email).toBe('john.doe@example.com');
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].field).toBe('all');
  });

  it('should fail if there is a duplicate email', async () => {
    await User.create({
      userId: `uniqueId_${Date.now()}`, // Use unique userId
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].field).toBe('email');
  });

  it('should log the user in successfully', async () => {
    try {
      await User.create({
        userId: `uniqueId_${Date.now()}`, // Use unique userId
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890'
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.smith@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should fail to log in with incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.smith@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toBe('Bad request');
    expect(res.body.message).toBe('Authentication failed');
  });
});
