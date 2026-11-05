const request = require('supertest');
const { createApp } = require('../src/app');

describe('shortlink API', () => {
  const app = createApp();

  test('health endpoint returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('creates a link and redirects to it', async () => {
    const created = await request(app).post('/links').send({ url: 'https://example.com' });
    expect(created.status).toBe(201);
    const res = await request(app).get(`/${created.body.code}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com/');
  });

  test('rejects an invalid url', async () => {
    const res = await request(app).post('/links').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  test('rejects a non-http scheme', async () => {
    const res = await request(app).post('/links').send({ url: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
  });

  test('returns 404 for an unknown code', async () => {
    const res = await request(app).get('/deadbeef');
    expect(res.status).toBe(404);
  });
});