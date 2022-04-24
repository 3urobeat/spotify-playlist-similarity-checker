/*
 * File: fetchPlaylist.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:47:40
 * Author: 3urobeat
 * 
 * Last Modified: 24.04.2022 17:31:01
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
 * @param {function} [callback] Called with `err` (String) on failure or `itemsObj` (Object) on success
 */
module.exports.fetchPlaylist = (playlistID, oAuthToken, callback) => {

    //arr for collecting all items
    const itemsObj = []

    //put fetching into function to be able to call it recursively for each part
    let fetchPart = (offset, part) => {

        //log debug and info msg
        logger("debug", `fetchPart(): Called with offset ${offset} & part ${part}`)
        logger("info", `Fetching playlist part ${part}...`, false, true, logger.animation("loading"));

        //Construct get request options obj - https://developer.spotify.com/console/get-playlist-tracks/
        let options = {
            hostname: "api.spotify.com",
            path: `/v1/playlists/${playlistID}/tracks?offset=${offset}&fields=items(track(artists(name)%2Cname))%2Ctotal`, //filter: track name, artists names, total songs in playlist
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${oAuthToken}`
            }
        }

        //make get request
        let request = https.request(options, (res) => {
            let data = "";
            let body;

            //listen for recieved data
            res.on("data", (chunk) => {
                data += chunk.toString();
            });

            //listen for completed request event
            res.on("end", () => {

                //try to convert recieved string into object
                try {
                    body = JSON.parse(data);
                } catch (err) {
                    callback(`Failed to parse response: ${err}`, null);
                }

                //Check if spotify responded with an error, otherwise callback data
                if (body["error"]) {
                    callback(`Spotify responded with error ${body.error.status}: ${body.error.message}`, null);
                } else {

                    //push all objects of new array to existing array
                    body.items.every(e => itemsObj.push(e))

                    //console.log(itemsObj)

                    //Check if we have to fetch more parts and call function again
                    if (body.total > (part + 1) * 100) {
                        logger("info", `Finished fetching playlist part ${part}, waiting ${config.fetchDelay}ms before continuing with next part...`, false, true, logger.animation("loading"));

                        //call this function again after fetchDelay ms with increased values
                        setTimeout(() => fetchPart(offset + 100, part + 1), config.fetchDelay);
                    } else {
                        callback(null, itemsObj); //finished
                    }
                }
            });
        })

        request.on("error", (err) => {
            callback(`Failed to make get request: ${err}`, null);
        });

        request.end();

    }

    //fetch first part
    fetchPart(0, 0);
}