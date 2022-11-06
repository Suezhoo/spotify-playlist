const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

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

server.get('/playlist/export', async (req, res) => {
    try {
        let playlist;
        await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/playlists/' + req.query.id,
            headers: {
                Authorization: `Bearer ${req.query.token}`,
                'Content-Type': 'application/json',
            },
        }).then(function (response) {
            if (response.status == 200) playlist = response;
        });
        // Collect data from playlist
        const result = await getTracks(req.query.token, req.query.id);
        // Create a JSON formatted text file

        // Prep data
        let fileData = '';

        for (let t of result.tracks) {
            const name = t.track.track.name;
            const albumName = t.track.track.album.name;
            const calcDuration = new Date(t.track.track.duration_ms);
            const addedAt = new Date(t.track.added_at).toLocaleDateString('en-US');
            const spotifyUrl = t.track.track.external_urls.spotify;

            fileData += `${name} ~ ${albumName} ~ ${calcDuration.getMinutes()}:${calcDuration.getSeconds()} ~ ${addedAt} ~ ${spotifyUrl} \n`;
        }
        // Create file
        const fileName = `playlist-${playlist.data.name}-${playlist.data.owner.id}-backup.txt`;
        fs.writeFileSync(fileName, fileData, (err) => {
            if (err) console.log(err);
            else console.log('File written.');
        });
        const filePath = `${__dirname}/${fileName}`;
        console.log('Downloading: ' + filePath);
        res.download(filePath);
        // Remove file
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

async function getTracks(token, playlistID, nextUrl = '', tracks = [], total = 0) {
    // First request
    if (nextUrl == '' || nextUrl == undefined) {
        await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=0&limit=50`,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
        }).then(async function (response) {
            for (let track of response.data.tracks.items) {
                const trackObj = { track };
                tracks.push(trackObj);
            }
            total = response.data.tracks.total;

            if (response.data.tracks.next) {
                nextUrl = response.data.tracks.next;
                await getTracks(token, playlistID, nextUrl, tracks, total);
            }
        });
    } // Next request untill end of total track count
    else {
        await axios({
            method: 'GET',
            url: nextUrl,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then(async function (response) {
            for (let track of response.data.items) {
                const trackObj = { track };
                tracks.push(trackObj);
            }
            if (response.data.next) await getTracks(token, playlistID, response.data.next, tracks, total);
        });
    }

    return { total, tracks };
}

server.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
