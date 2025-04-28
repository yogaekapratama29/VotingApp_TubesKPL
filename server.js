import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

const pollings = new Map();

app.use(bodyParser.json());
app.use(express.static('public'));

// Routes

app.get('/pollings', (req, res) => {
  const allPollings = Array.from(pollings.values()).map((p) => ({
    contributor: p.contributor,
    title: p.title,
    options: p.options,
    isClosed: p.isClosed,
  }));
  res.json(allPollings);
});

app.post('/pollings', (req, res) => {
  const { contributor, title, options } = req.body;
  if (!contributor || !title || !options) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  pollings.set(contributor, {
    contributor,
    title,
    options,
    votes: new Map(),
    isClosed: false,
  });
  res.json({ message: 'Polling created successfully' });
});

app.post('/pollings/:contributor/vote', (req, res) => {
  const { contributor } = req.params;
  const { voterName, choice } = req.body;

  const polling = pollings.get(contributor);
  if (!polling || polling.isClosed) {
    return res.status(404).json({ message: 'Polling not found or closed' });
  }

  polling.votes.set(voterName, choice);
  res.json({ message: 'Vote saved' });
});

app.get('/pollings/:contributor/results', (req, res) => {
  const { contributor } = req.params;
  const polling = pollings.get(contributor);
  if (!polling) {
    return res.status(404).json({ message: 'Polling not found' });
  }

  const result = {};
  polling.options.forEach((opt) => (result[opt] = 0));
  for (const vote of polling.votes.values()) {
    result[vote]++;
  }

  res.json(result);
});

app.delete('/pollings/:contributor', (req, res) => {
  const { contributor } = req.params;

  if (!pollings.has(contributor)) {
    return res.status(404).json({ message: 'Polling not found' });
  }

  pollings.delete(contributor);
  res.json({ message: 'Polling deleted successfully' });
});

app.get('/pollings/:contributor/results', (req, res) => {
    const { contributor } = req.params;
    const polling = pollings.get(contributor);
    if (!polling) {
    return res.status(404).json({ message: 'Polling not found' });
    }

    const result = {};
    polling.options.forEach(opt => result[opt] = 0);
    for (const vote of polling.votes.values()) {
    result[vote]++;
    }

    res.json(result);
});


// Start the server
app.listen(port, () => {
  console.log(`Server Berjalan pada http://localhost:${port}`);
});
