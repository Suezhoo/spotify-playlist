const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

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

server.get('/token', async (req, res) => {
    try {
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;

        const encoded = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

        await axios({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                Authorization: 'Basic ' + encoded,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                grant_type: 'client_credentials',
            },
            json: true,
        })
            .then(function (response) {
                res.status(200).send(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (err) {
        console.log(err);
    }
});

server.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
