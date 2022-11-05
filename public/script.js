'use strict;';

let token;

// Playlist ids
// 4NepCfIQDBifrAKHCuTnJq?si=25cc2fd13d104cad
// 5AGEjbB4biEBlSXDhUI2ZU?si=74d6bcc8595541e0

// Playlist URL
// https://open.spotify.com/playlist/4NepCfIQDBifrAKHCuTnJq?si=25cc2fd13d104cad&nd=1

window.onload = async () => {
    initHTML();
    initEventListeners();
    token = await getToken();
    token = token.access_token;
};

function initHTML() {
    document.querySelector('.playlist-info').innerHTML = `<h1 class="title">Playlist Backup</h1>
    <p class="description">Want to backup your playlists? All we need is the playlist ID or URL and we will export your tracks into a single file.</p>
    <input type="text" name="playlist-id" id="playlist-id" placeholder="Playlist ID / URL" required autofocus />
    <div class="button" id="submit">Submit</div>`;
}

function initEventListeners() {
    const submitBTN = document.querySelector('#submit');

    submitBTN.addEventListener('click', () => {
        const playlist = document.querySelector('#playlist-id').value;
        if (playlist == '') return console.log('Empty input');

        // Accept either ID or URL
        let id;
        if (playlist.indexOf('https://open.spotify.com/playlist/') == 0) {
            id = playlist.substring(playlist.lastIndexOf('/') + 1);
        } else id = playlist;

        getPlaylist(id, token);
    });

    const discordDiv = document.querySelector('.discord');
    discordDiv.addEventListener('click', () => {
        const tag = document.querySelector('#name').innerHTML;
        navigator.clipboard.writeText(tag);
        alert(`Copied to clipboard: ${tag}`);
    });
}

/**
 *
 * @returns {*} Bearer token
 */
async function getToken() {
    return fetch('http://localhost:1337/token', {
        method: 'GET',
    }).then((res) => res.json());
}

/**
 *
 *
 * @param {*} id
 * @param {*} token
 */
async function getPlaylist(id, token) {
    await fetch('http://localhost:1337/playlist/?id=' + id, {
        method: 'GET',
        headers: {
            authorization: token,
        },
    })
        .then((res) => {
            if (res.status == 200) return res.json();
            else return console.log(res);
        })
        .then((data) => {
            if (data == undefined) return console.log('Error with displaying data');
            document.querySelector('.playlist-info').innerHTML = `
            <div class="result">
                <div class="playlist-card">
                    <img src="${data.images[0].url}" alt="album-picture" />
                    <div class="details">
                        <p>${data.type.toUpperCase()}</p>
                        <h1>${data.name}</h1>
                        <p>${data.owner.display_name} ~ ${data.followers.total} likes ~ ${data.tracks.total.toLocaleString()} songs</p>
                    </div>
                </div>
                <table class="tracks">
                    <tbody class="tracks-body">
                        <tr class="th-underline">
                            <th class="first">#</th>
                            <th>Title</th>
                        </tr>
                    </tbody>
                </table>
            </div>`;

            // Display x amount of tracks where => x = for(let i = 0; i < X; i++)
            for (let i = 0; i < 6; i++) {
                let rowString = `
                <tr>
                    <td>${i + 1}</td>
                    <td class="track-content">
                        <img src="${data.tracks.items[i].track.album.images[data.tracks.items[i].track.album.images.length - 1].url}" alt="thumbnail"></img> 
                        <span>${data.tracks.items[i].track.name}</span>
                    </td>
                </tr>`;
                document.querySelector('.tracks-body').insertAdjacentHTML('beforeend', rowString);
            }

            const button = `<div class="button" id="export">Export</div>`;

            document.querySelector('.playlist-info').insertAdjacentHTML('beforeend', button);
        });
}
