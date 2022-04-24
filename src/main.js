/*
 * File: main.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:46:18
 * Author: 3urobeat
 * 
 * Last Modified: 24.04.2022 12:06:02
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

const version = "0.1";


/**
 * Entry point
 */
module.exports.run = () => {

    //Configure my logging library (https://github.com/HerrEurobeat/output-logger#options-1)
    logger.options({
        msgstructure: `[${logger.Const.ANIMATION}] [${logger.Const.DATE} | ${logger.Const.TYPE}] ${logger.Const.MESSAGE}`,
        paramstructure: [logger.Const.TYPE, logger.Const.MESSAGE, "nodate", "remove", logger.Const.ANIMATION],
        outputfile: "./output.txt",
        animationdelay: 250
    })


    //log startup message
    logger("", "", true);
    logger("info", `spotify-playlist-similarity-checker v${version} by 3urobeat\n`)


    //check if user provided needed config values
    if (config.playlistID.length < 1 || config.oAuthToken.length < 1) {
        logger("error", "Please provide a playlistID and oAuthToken in the config! Aborting...");
        process.exit(9); //https://nodejs.org/api/process.html#process_exit_codes
    }

}