var express = require('express');
var router = express.Router();

const pollings = new Map();

pollings.set('177013', {
  kode: '177013',
  contributor: 'Nizar',
  title: 'Anime Terbaik',
  options: ['Naruto', 'Wanpis', 'Bengdrim'],
  votes: new Map(),
  isClosed: false,
});

// Get All Pollings
router.get('/', (req, res) => {
  const allPollings = Array.from(pollings.values()).map((p) => ({
    kode: p.kode,
    contributor: p.contributor,
    title: p.title,
    options: p.options,
    isClosed: p.isClosed,
  }));

  res.json(allPollings);
});

// Create Polling
router.post('/', (req, res) => {
  const { kode, contributor, title, options } = req.body;

  if (!kode || !contributor || !title || !options) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  
  pollings.set(kode, {
    kode,
    contributor,
    title,
    options,
    votes: new Map(),
    isClosed: false,
  });
  
  res.json({ message: 'Polling created successfully' });
});

// Get Polling by Kode
router.get('/:kode', (req, res) => {
  const { kode } = req.params;
  const polling = pollings.get(kode);
  
  if (!polling) return res.status(404).json({ message: 'Polling not found' });
  
  res.json({
    kode: polling.kode,
    contributor: polling.contributor,
    title: polling.title,
    options: polling.options,
    isClosed: polling.isClosed,
  });
});

// Delete Polling
router.delete('/:kode', (req, res) => {
  const { kode } = req.params;

  if (!pollings.has(kode)) {
    return res.status(404).json({ message: 'Polling not found' });
  }

  pollings.delete(kode);
  res.json({ message: 'Polling deleted successfully' });
});

// Create Vote
router.post('/:kode/vote', (req, res) => {
  const { kode } = req.params;
  const { voterName, choice } = req.body;
  const polling = pollings.get(kode);
  
  if (!polling || polling.isClosed) return res.status(404).json({ message: 'Polling not found or closed' });

  polling.votes.set(voterName, choice);

  res.json({ message: 'Vote saved' });
});

// Get Polling Result
router.get('/:kode/results', (req, res) => {
  const { kode } = req.params;
  const polling = pollings.get(kode);
  const result = {};
  
  if (!polling) return res.status(404).json({ message: 'Polling not found' });

  polling.options.forEach(opt => result[opt] = 0);
  
  for (const vote of polling.votes.values()) { result[vote]++; }

  res.json(result);
});

module.exports = router;
