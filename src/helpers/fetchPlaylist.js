/*
 * File: fetchPlaylist.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:47:40
 * Author: 3urobeat
 *
 * Last Modified: 14.06.2023 23:34:46
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 *
 * Licensed under the MIT license: https://opensource.org/licenses/MIT
 * Permission is granted to use, copy, modify, and redistribute the work.
 * Full license information available in the project LICENSE file.
 */


const https  = require("https");
const logger = require("output-logger");

const config = require("../../config.json");


/**
 * Internal function to fetch playlist content from Spotify
 * @param {String} playlistID The playlist to fetch from Spotify
 * @param {String} oAuthToken The Spotify oAuthToken to authorize the request with
 * @returns {Promise.<array.<string>>} Returns a promise that is resolved with an array, containing all song objects, or rejected with an error message.
 */
module.exports.fetchPlaylist = (playlistID, oAuthToken) => {
    return new Promise((resolve, reject) => {

        // Arr for collecting all items
        const items = [];

        // Put fetching into function to be able to call it recursively for each part
        let fetchPart = (offset, part) => {

            // Log debug and info msg
            logger("debug", `fetchPart(): Called with offset ${offset} & part ${part}`);
            logger("info", `Fetching playlist part ${part}...`, false, true, logger.animation("loading"));

            // Construct get request options obj - https://developer.spotify.com/console/get-playlist-tracks/
            let options = {
                hostname: "api.spotify.com",
                path: `/v1/playlists/${playlistID}/tracks?offset=${offset}&fields=items(track(artists(name)%2Cname))%2Ctotal`, // Filter: track name, artists names, total songs in playlist
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${oAuthToken}`
                }
            };

            // Make get request
            let request = https.request(options, (res) => {
                let data = "";
                let body;

                // Listen for recieved data
                res.on("data", (chunk) => {
                    data += chunk.toString();
                });

                // Listen for completed request event
                res.on("end", () => {

                    // Try to convert recieved string into object
                    try {
                        body = JSON.parse(data);
                    } catch (err) {
                        reject(`Failed to parse response: ${err}`);
                    }

                    // Check if spotify responded with an error, otherwise resolve with data
                    if (body["error"]) {
                        reject(`Spotify responded with error ${body.error.status}: ${body.error.message}`);
                    } else {

                        // Push all objects of new array to existing array
                        body.items.every(e => items.push(e));

                        // Check if we have to fetch more parts and call function again
                        if (body.total > (part + 1) * 100) {
                            logger("info", `Finished fetching playlist part ${part}, waiting ${config.fetchDelay}ms before continuing with next part...`, false, true, logger.animation("loading"));

                            // Call this function again after fetchDelay ms with increased values
                            setTimeout(() => fetchPart(offset + 100, part + 1), config.fetchDelay);

                        } else {

                            resolve(items); // Finished
                        }
                    }
                });
            });

            request.on("error", (err) => {
                reject(`Failed to make get request: ${err}`);
            });

            request.end();

        };

        // Fetch first part
        fetchPart(0, 0);

    });
};