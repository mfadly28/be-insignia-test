// tests/users.test.js
const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const User = require('../models/user');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // bersihkan DB test
});

afterAll(async () => {
  await sequelize.close();
});

describe('User API', () => {
  let token;
  test('POST /api/users creates a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /api/login returns token', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    token = res.body.accessToken;
  });

  test('GET /api/users requires auth', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/users with token returns list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('email', 'test@example.com');
  });
});
