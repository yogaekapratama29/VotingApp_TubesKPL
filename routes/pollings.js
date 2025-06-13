// routes/pollings.js
var express = require('express');
var router = express.Router();
const pollingService = require('../services/pollingService'); // Impor service

// Get All Pollings
router.get('/', (req, res) => {
  const allPollings = pollingService.getAllPollings();
  res.json(allPollings);
});

// Create Polling
router.post('/', (req, res) => {
  const { success, message } = pollingService.createPolling(req.body);
  if (!success) {
    // Mengembalikan status yang lebih spesifik berdasarkan pesan
    if (message === 'Data tidak valid') {
      return res.status(400).json({ message });
    }
    if (message === 'Polling dengan kode ini sudah ada.') {
      return res.status(409).json({ message }); // Conflict
    }
    return res.status(500).json({ message: 'Terjadi kesalahan saat membuat polling.' });
  }
  res.status(200).json({ message });
});

// Get Polling by Kode
router.get('/:kode', (req, res) => {
  const { success, polling, message } = pollingService.getPollingByKode(req.params.kode);
  if (!success) {
    return res.status(404).json({ message });
  }
  res.json(polling);
});

// Delete Polling
router.delete('/:kode', (req, res) => {
  const { success, message } = pollingService.deletePolling(req.params.kode);
  if (!success) {
    return res.status(404).json({ message });
  }
  res.json({ message });
});

// Create Vote
router.post('/:kode/vote', (req, res) => {
  const { kode } = req.params;
  const { voterName, choice } = req.body;
  
  const { success, message } = pollingService.recordVote(kode, voterName, choice);
  if (!success) {
    // Mengembalikan status yang lebih spesifik berdasarkan pesan
    if (message === 'Pilihan suara tidak valid') {
      return res.status(400).json({ message });
    }
    return res.status(404).json({ message });
  }
  res.json({ message });
});

// Get Polling Result
router.get('/:kode/results', (req, res) => {
  const { success, results, message } = pollingService.getPollingResults(req.params.kode);
  if (!success) {
    return res.status(404).json({ message });
  }
  res.json(results);
});

module.exports = router;