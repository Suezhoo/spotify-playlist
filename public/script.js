'use strict;';

window.onload = async () => {
    console.log('Hello World from JS');

    const token = await getToken();

    console.log(token);
};

/**
 *
 * @returns Bearer token
 */
async function getToken() {
    return fetch('http://localhost:1337/token', {
        method: 'GET',
    }).then((res) => res.json());
}
