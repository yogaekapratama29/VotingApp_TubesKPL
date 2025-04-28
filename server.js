import express from 'express';
import bodyParser from 'body-parser';


const app = express();
const port = 3000;

const pollings = new Map();

app.use(bodyParser.json());
app.use(express.static('public'));

// Routes 

app.get('/pollings', (req, res) => {
    const allPollings = Array.from(pollings.values()).map(p => ({
        contributor: p.contributor,
        title : p.title,
        options : p.options,
        isClosed : p.isClosed,
    }));
    res.json(allPollings);
})

app.delete('/pollings/:contributor', (req, res) => {
    const { contributor } = req.params;
  
    if (!pollings.has(contributor)) {
      return res.status(404).json({ message: 'Polling not found' });
    }
  
    pollings.delete(contributor);
    res.json({ message: 'Polling deleted successfully' });
  });
  
// Start the server
app.listen(port, () => {
    console.log(`Server Berjalan pada http://localhost:${port}`);
})