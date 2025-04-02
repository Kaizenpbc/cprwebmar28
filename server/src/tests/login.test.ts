import request from 'supertest';
import { app } from '../index';
import { pool } from '../db';

describe('Login API Tests', () => {
  beforeAll(async () => {
    // Ensure database connection
    await pool.connect();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid instructor credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'instructor1@example.com',
          password: 'password123',
          portal: 'instructor'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'instructor');
    });

    it('should login successfully with valid student credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student1@example.com',
          password: 'password123',
          portal: 'student'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'student');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'instructor1@example.com',
          password: 'wrongpassword',
          portal: 'instructor'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
          portal: 'instructor'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail with missing portal selection', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'instructor1@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Portal selection is required');
    });
  });
}); 