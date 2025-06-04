import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

const pollings = new Map();

pollings.set('177013', {
  kode: '177013',
  contributor: 'Nizar',
  title: 'Anime Terbaik',
  options: ['Naruto', 'Wanpis', 'Bengdrim'],
  votes: new Map(),
  isClosed: false,
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.get('/pollings', (req, res) => {
  const allPollings = Array.from(pollings.values()).map((p) => ({
    kode: p.kode,
    contributor: p.contributor,
    title: p.title,
    options: p.options,
    isClosed: p.isClosed,
  }));
  res.json(allPollings);
});

app.post('/pollings', (req, res) => {
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

app.get('/pollings/:kode', (req, res) => {
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

app.post('/pollings/:kode/vote', (req, res) => {
  const { kode } = req.params;
  const { voterName, choice } = req.body;

  const polling = pollings.get(kode);
  if (!polling || polling.isClosed) {
    return res.status(404).json({ message: 'Polling not found or closed' });
  }

  polling.votes.set(voterName, choice);
  res.json({ message: 'Vote saved' });
});

app.delete('/pollings/:kode', (req, res) => {
  const { kode } = req.params;

  if (!pollings.has(kode)) {
    return res.status(404).json({ message: 'Polling not found' });
  }

  pollings.delete(kode);
  res.json({ message: 'Polling deleted successfully' });
});

app.get('/pollings/:kode/results', (req, res) => {
    const { kode } = req.params;
    const polling = pollings.get(kode);
    if (!polling) {
        return res.status(404).json({ message: 'Polling not found' });
    }

    const result = {};
    polling.options.forEach(opt => result[opt] = 0);
    for (const vote of polling.votes.values()) {
        result[vote]++;
    }

    console.log(polling);
    res.json(result);
});

// Start the server
app.listen(port, () => {
  console.log(`Server Berjalan pada http://localhost:${port}`);
});
