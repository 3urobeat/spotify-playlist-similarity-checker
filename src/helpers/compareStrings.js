/*
 * File: compareStrings.js
 * Project: spotify-playlist-similarity-checker
 * Created Date: 22.04.2022 19:49:04
 * Author: 3urobeat
 * 
 * Last Modified: 14.06.2023 22:59:59
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * Licensed under the MIT license: https://opensource.org/licenses/MIT
 * Permission is granted to use, copy, modify, and redistribute the work.
 * Full license information available in the project LICENSE file.
 */


// Get data passed to this worker
const { parentPort, workerData } = require("worker_threads");

let arr        = workerData.songsStrArr;
let config     = workerData.config;
let rangeStart = workerData.rangeStart;
let rangeEnd   = workerData.rangeEnd;


// Create arrays for tracking duplicates and similarities for this worker
let duplicates = [];
let similarities = [];


// Check if rangeEnd is greater than amount of strings in array
if (rangeEnd >= arr.length) rangeEnd = arr.length;


// Start to compare
for (let i = rangeStart; i < rangeEnd; i++) {
    for (let j = 0; j < arr.length; j++) {

        // Compare if not the same index (otherwise everything would be duplicate ofc)
        if (i != j) {
            if (arr[i] == arr[j]) {
                if (!duplicates.includes(`100%: "${arr[i]}"`)) duplicates.push(`100%: "${arr[i]}"`) // Push if not already in arr

            } else {

                // Compare the two strings using the helper function above and limit to 2 decimals
                let similarityPerc = (jaroWrinker(arr[i], arr[j]) * 100).toFixed(2);

                // Push to similarities object if >ignoreSimilarityBelowPerc % and doesn't exist yet (for example the other way around)
                let compStr         = `${similarityPerc}%: "${arr[i]}"  &  "${arr[j]}"`
                let compStrReversed = `${similarityPerc}%: "${arr[j]}"  &  "${arr[i]}"`
                
                if (similarityPerc > config.ignoreSimilarityBelowPerc) similarities.push({ compStr: compStr, compStrReversed: compStrReversed, similarityPerc: similarityPerc });
            }
        }

        // Check if done and send our result back to the parent
        if (j + 1 == arr.length && i + 1 == rangeEnd) {
            parentPort.postMessage({ "dup": duplicates, "sim": similarities });
        }

    }
}


// Credit: https://sumn2u.medium.com/string-similarity-comparision-in-js-with-examples-4bae35f13968 & https://gist.github.com/sumn2u/0e0b5d9505ad096284928a987ace13fb#file-jaro-wrinker-js
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