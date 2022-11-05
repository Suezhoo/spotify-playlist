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

/**
 *  Retrieves access token from https://accounts.spotify.com/api/token
 *
 * @returns Bearer access token
 */
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
                if (response.status == 200) res.status(200).send(response.data);
                else res.status(500).send('Something went wrong.');
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (err) {
        console.log(err);
    }
});

/**
 * Gets playlist based on ID
 *
 * @params id - Id of the playlist
 * @headers authorization - spotify access token
 * @returns playlist
 *
 */
server.get('/playlist', async (req, res) => {
    try {
        await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/playlists/' + req.query.id,
            headers: {
                Authorization: 'Bearer ' + req.headers.authorization,
                'Content-Type': 'application/json',
            },
        }).then(function (response) {
            if (response.status == 200) res.status(200).send(response.data);
        });
    } catch (err) {
        res.status(err.response.status).send(err.response.statusText);
    }
});

server.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
