/*
 * File: compareStrings.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:49:04
 * Author: 3urobeat
 * 
 * Last Modified: 24.04.2022 16:55:48
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * Licensed under the MIT license: https://opensource.org/licenses/MIT
 * Permission is granted to use, copy, modify, and redistribute the work.
 * Full license information available in the project LICENSE file.
 */


const logger = require("output-logger");


//Credit: https://sumn2u.medium.com/string-similarity-comparision-in-js-with-examples-4bae35f13968 & https://gist.github.com/sumn2u/0e0b5d9505ad096284928a987ace13fb#file-jaro-wrinker-js
function jaroWrinker(s1, s2) {
    var m = 0;

    // Exit early if either are empty.
    if ( s1.length === 0 || s2.length === 0 ) {
        return 0;
    }

    // Exit early if they're an exact match.
    if ( s1 === s2 ) {
        return 1;
    }

    var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
        s1Matches = new Array(s1.length),
        s2Matches = new Array(s2.length);

    for ( i = 0; i < s1.length; i++ ) {
        var low  = (i >= range) ? i - range : 0,
            high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

        for ( j = low; j <= high; j++ ) {
        if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
            ++m;
            s1Matches[i] = s2Matches[j] = true;
            break;
        }
        }
    }

    // Exit early if no matches were found.
    if ( m === 0 ) {
        return 0;
    }

    // Count the transpositions.
    var k = n_trans = 0;

    for ( i = 0; i < s1.length; i++ ) {
        if ( s1Matches[i] === true ) {
        for ( j = k; j < s2.length; j++ ) {
            if ( s2Matches[j] === true ) {
            k = j + 1;
            break;
            }
        }

        if ( s1[i] !== s2[j] ) {
            ++n_trans;
        }
        }
    }

    var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
        l      = 0,
        p      = 0.1;

    if ( weight > 0.7 ) {
        while ( s1[l] === s2[l] && l < 4 ) {
        ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}


/**
 * Internal function to compare two Strings
 * @param {Array.<String>} arr Array containing all Strings to compare
 * @param {function} [callback] Called with `duplicates` (Array) and `similarities` (Array) on completion
 */
module.exports.compareStrings = (arr, callback) => {
    logger("info", `Starting to compare ${arr.length} song titles...`, false, false, logger.animation("loading"));

    //create two arrays for collecting duplicates and non-duplicates with their similarity
    let duplicates   = [];
    let similarities = [];
    
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {

            //compare if not the same index (otherwise everything would be duplicate ofc)
            if (i != j) {
                if (arr[i] == arr[j]) {
                    
                    if (!duplicates.includes(arr[i])) duplicates.push(`100%: "${arr[i]}"`) //push if not already in arr

                } else {

                    //compare the two strings using the helper function above and limit to 2 decimals
                    let similarityPerc = (jaroWrinker(arr[i], arr[j]) * 100).toFixed(2);

                    //push to similarities object if >90% and doesn't exist yet (for example the other way around)
                    let compStr         = `${similarityPerc}%: "${arr[i]}"  &  "${arr[j]}"`
                    let compStrReversed = `${similarityPerc}%: "${arr[j]}"  &  "${arr[i]}"` //the other way around for check below
                    
                    if (similarityPerc > 90 && !similarities.some(e => e.compStr == compStr || e.compStr == compStrReversed)) similarities.push({ compStr: compStr, similarityPerc: similarityPerc });
                    
                }
            }

            //check if done
            if (i + 1 == arr.length && j + 1 == arr.length) {
                similarities.sort((a, b) => { return b.similarityPerc - a.similarityPerc; }) //sort similarities descending by similarity in percent

                logger("info", "Finished comparing and sorting all song titles!", false, true);

                callback(duplicates, similarities);
            }
        }
    }
}