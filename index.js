const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

// Global VAR
const server = express();
const port = process.env.PORT;

// Middleware
server.use(cors());
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.json());

server.get('/', (req, res) => {
    res.status(300).redirect('/index.html');
});

server.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
