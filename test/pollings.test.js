const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals = {};
  next();
});

const pollingsRouter = require('../routes/pollings');
const pollingService = require('../services/pollingService'); // Impor service yang baru

app.use('/pollings', pollingsRouter);

describe('Pollings API', () => {
  // Reset state service sebelum setiap test
  beforeEach(() => {
    pollingService._resetState();
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
    expect(res.body.message).toBe('Polling berhasil dibuat');

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
    expect(res.body.message).toBe('Data tidak valid');
  });

  test('POST /pollings harus mengembalikan 409 jika kode polling sudah ada', async () => {
    const existingPolling = {
      kode: '177013', // Kode ini sudah ada dari initial setup
      contributor: 'Another User',
      title: 'Duplicate Polling',
      options: ['Opt1'],
    };
    const res = await request(app)
      .post('/pollings')
      .send(existingPolling);
    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toBe('Polling dengan kode ini sudah ada.');
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
    expect(res.body.message).toBe('Polling tidak ditemukan');
  });

  test('DELETE /pollings/:kode harus menghapus polling', async () => {
    const res = await request(app).delete('/pollings/177013');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Polling berhasil dihapus');

    const getRes = await request(app).get('/pollings/177013');
    expect(getRes.statusCode).toEqual(404);
  });

  test('DELETE /pollings/:kode harus mengembalikan 404 jika polling tidak ditemukan', async () => {
    const res = await request(app).delete('/pollings/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling tidak ditemukan');
  });

  test('POST /pollings/:kode/vote harus mencatat suara', async () => {
    const voteData = { voterName: 'Alice', choice: 'Naruto' };
    const res = await request(app)
      .post('/pollings/177013/vote')
      .send(voteData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Suara berhasil disimpan'); // Pesan diubah
  });

  test('POST /pollings/:kode/vote harus mengembalikan 404 jika polling tidak ditemukan atau ditutup', async () => {
    const voteData = { voterName: 'Alice', choice: 'Option A' };
    const res = await request(app)
      .post('/pollings/nonexistent/vote')
      .send(voteData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Polling tidak ditemukan atau sudah ditutup');

    // Simulasikan polling yang ditutup menggunakan service
    pollingService._getRawPolling('177013').isClosed = true;
    const closedRes = await request(app)
      .post('/pollings/177013/vote')
      .send(voteData);
    expect(closedRes.statusCode).toEqual(404);
    expect(closedRes.body.message).toBe('Polling tidak ditemukan atau sudah ditutup');
  });

  test('POST /pollings/:kode/vote harus mengembalikan 400 jika pilihan suara tidak valid', async () => {
    const voteData = { voterName: 'Alice', choice: 'Tidak Ada' }; // Pilihan tidak ada di opsi
    const res = await request(app)
      .post('/pollings/177013/vote')
      .send(voteData);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Pilihan suara tidak valid');
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
    expect(res.body.message).toBe('Polling tidak ditemukan');
  });
});