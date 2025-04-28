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
})