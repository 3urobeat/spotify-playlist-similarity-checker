/*
 * File: main.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:46:18
 * Author: 3urobeat
 * 
 * Last Modified: 24.04.2022 17:52:47
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * Licensed under the MIT license: https://opensource.org/licenses/MIT
 * Permission is granted to use, copy, modify, and redistribute the work.
 * Full license information available in the project LICENSE file.
 */


const logger = require("output-logger");

const config = require("../config.json");

const version = "1.0";


/**
 * Entry point
 */
module.exports.run = () => {

    //Configure my logging library (https://github.com/HerrEurobeat/output-logger#options-1)
    logger.options({
        msgstructure: `[${logger.Const.ANIMATION}] [${logger.Const.DATE} | ${logger.Const.TYPE}] ${logger.Const.MESSAGE}`,
        paramstructure: [logger.Const.TYPE, logger.Const.MESSAGE, "nodate", "remove", logger.Const.ANIMATION],
        outputfile: "./output.txt",
        animationdelay: 250,
        printdebug: false
    })


    //log startup message
    logger("", "", true);
    logger("info", `spotify-playlist-similarity-checker v${version} by 3urobeat\n`)


    //check if user provided needed config values
    if (config.playlistID.length < 1 || config.oAuthToken.length < 1) {
        logger("error", "Please provide a playlistID and oAuthToken in the config! Aborting...");
        process.exit(9); //https://nodejs.org/api/process.html#process_exit_codes
    }


    //get playlist data from Spotify
    logger("info", "Fetching playlist data from Spotify...", false, false, logger.animation("loading"));

    require("./helpers/fetchPlaylist.js").fetchPlaylist(config.playlistID, config.oAuthToken, (err, data) => {
        
        //check for err in callback and abort
        if (err) {
            logger("error", `An error ocurred while trying to fetch playlist data from Spotify!\nError: ${err}\n\nAborting...`);
            process.exit(1);
        }

        logger("info", `Successfully fetched ${data.length} songs from Spotify!`);

        //require("fs").writeFileSync("./fetchedSongs.json", JSON.stringify(data, null, 4), err => {}) //uncomment to save fetched songs
        
        //convert each track obj into one string
        let songsStrArr = [];

        data.forEach((e, i) => {
            let temp = ""

            //add all artists
            e.track.artists.every((f, j) => { 
                if (j > 0) temp += ", " //add comma infront if not first iteration
                temp += `${f.name}`
            })

            //add track title
            temp += ` - ${e.track.name}`

            //push temp str
            songsStrArr.push(temp);

            //check if finished
            if (i + 1 == data.length) {
                //logger("", songsStrArr, true) //uncomment to log all song titles that were fetched

                //display warning message if arr is large af
                if (songsStrArr.length > 2000) logger("warn", `Comparing ${data.length} song titles will take a while. Please be patient...`)

                //compare strings
                require("./helpers/compareStrings.js").compareStrings(songsStrArr, (duplicates, similarities) => {
                    
                    //print results
                    if (duplicates.length > 0) {
                        let temp = "";
                        duplicates.every((e) => temp += `+ ${e}\n`)

                        logger("", "", true);
                        logger("info", `I found ${duplicates.length} duplicate song titles:`)
                        logger("", temp, true);
                    } else {
                        logger("info", "No duplicate song titles found!\n")
                    }

                    
                    if (similarities.length > 0) {
                        let temp = "";
                        similarities.every((e) => temp += `+ ${e.compStr}\n`)

                        logger("", "", true);
                        logger("info", `I found ${similarities.length} similar song titles:`)
                        logger("", temp, true);
                    } else {
                        logger("info", "No similar song titles found!\n")
                    }

                    
                    logger("info", "Done! Exiting...\n");
                })
            }
        })
    })
}