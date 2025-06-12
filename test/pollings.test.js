const request = require('supertest');
const express = require('express');

// Mock aplikasi express untuk mengisolasi router pollings untuk pengujian
const app = express();
app.use(express.json()); // Aktifkan penguraian body JSON untuk test
app.use(express.urlencoded({ extended: false })); // Aktifkan penguraian body URL-encoded
app.use((req, res, next) => {
  res.locals = {}; // Inisialisasi res.locals jika diperlukan oleh middleware atau route
  next();
});

// Impor router pollings dari file yang sebenarnya
const pollingsRouter = require('../routes/pollings'); //
app.use('/pollings', pollingsRouter);

describe('Pollings API', () => {
  let initialPollingsSize;

  beforeAll(() => {
    // Akses peta pollings internal dan simpan ukuran awalnya
    // Ini sedikit 'hacky' dan bergantung pada detail implementasi internal pollings.js
    // Pendekatan yang lebih baik untuk aplikasi nyata adalah dengan mengekspor fungsi untuk menghapus/mereset peta,
    // atau menggunakan database khusus di memori yang dapat diatur ulang untuk setiap test.
    initialPollingsSize = pollingsRouter.pollings.size;
  });

  afterEach(() => {
    // Reset peta pollings ke keadaan awal untuk setiap test
    // Ini memastikan test terisolasi dan tidak saling mempengaruhi.
    pollingsRouter.pollings.clear();
    pollingsRouter.pollings.set('177013', {
      kode: '177013',
      contributor: 'Nizar',
      title: 'Anime Terbaik',
      options: ['Naruto', 'Wanpis', 'Bengdrim'],
      votes: new Map(),
      isClosed: false,
    });
  });

  test('GET /pollings harus mengembalikan semua polling', async () => {
    const res = await request(app).get('/pollings');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('kode', '177013');
  });

  test('POST /pollings harus membuat polling baru', async () => {
    const newPolling = {
      kode: 'new123',
      contributor: 'Test User',
      title: 'New Test Polling',
      options: ['Option A', 'Option B'],
    };
    const res = await request(app)
      .post('/pollings')
      .send(newPolling);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Polling created successfully');

    const getRes = await request(app).get('/pollings');
    expect(getRes.body.some(p => p.kode === 'new123')).toBe(true);
  });

  test('POST /pollings harus mengembalikan 400 untuk data yang tidak valid', async () => {
    const invalidPolling = {
      kode: 'invalid',
      contributor: 'Test User',
      options: ['Option A', 'Option B'],
    };
    const res = await request(app)
      .post('/pollings')
      .send(invalidPolling);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Invalid data');
  });

  test('GET /pollings/:kode harus mengembalikan polling tertentu', async () => {
    const res = await request(app).get('/pollings/177013');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('kode', '177013');
    expect(res.body).toHaveProperty('title', 'Anime Terbaik');
  });

  test('GET /pollings/:kode harus mengembalikan 404 jika polling tidak ditemukan', async () => {
    const res = await request(app).get('/pollings/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling not found');
  });

  test('DELETE /pollings/:kode harus menghapus polling', async () => {
    const res = await request(app).delete('/pollings/177013');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Polling deleted successfully');

    const getRes = await request(app).get('/pollings/177013');
    expect(getRes.statusCode).toEqual(404);
  });

  test('DELETE /pollings/:kode harus mengembalikan 404 jika polling tidak ditemukan', async () => {
    const res = await request(app).delete('/pollings/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling not found');
  });

  test('POST /pollings/:kode/vote harus mencatat suara', async () => {
    const voteData = { voterName: 'Alice', choice: 'Naruto' };
    const res = await request(app)
      .post('/pollings/177013/vote')
      .send(voteData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Vote saved');

    const resultsRes = await request(app).get('/pollings/177013/results');
    expect(resultsRes.statusCode).toEqual(200);
    expect(resultsRes.body.Naruto).toBe(1);
  });

  test('POST /pollings/:kode/vote harus mengembalikan 404 jika polling tidak ditemukan atau ditutup', async () => {
    const voteData = { voterName: 'Alice', choice: 'Option A' };
    const res = await request(app)
      .post('/pollings/nonexistent/vote')
      .send(voteData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling not found or closed');

    // Simulasikan polling yang ditutup
    pollingsRouter.pollings.get('177013').isClosed = true;
    const closedRes = await request(app)
      .post('/pollings/177013/vote')
      .send(voteData);
    expect(closedRes.statusCode).toEqual(404);
    expect(closedRes.body.message).toBe('Polling not found or closed');
  });

  test('GET /pollings/:kode/results harus mengembalikan hasil polling', async () => {
    await request(app).post('/pollings/177013/vote').send({ voterName: 'Alice', choice: 'Naruto' });
    await request(app).post('/pollings/177013/vote').send({ voterName: 'Bob', choice: 'Wanpis' });
    await request(app).post('/pollings/177013/vote').send({ voterName: 'Charlie', choice: 'Naruto' });

    const res = await request(app).get('/pollings/177013/results');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      Naruto: 2,
      Wanpis: 1,
      Bengdrim: 0,
    });
  });

  test('GET /pollings/:kode/results harus mengembalikan 404 jika polling tidak ditemukan', async () => {
    const res = await request(app).get('/pollings/nonexistent/results');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling not found');
  });
});