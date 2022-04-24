# spotify-playlist-similarity-checker
This script fetches all songs in your provided playlist and compares them.  
Similar artist title pairs will be listed together and their similarity displayed in percent.  
Exact duplicates are listed seperately.  

&nbsp; 

## Download:
Click here: [Download](https://github.com/HerrEurobeat/spotify-playlist-similarity-checker/archive/refs/heads/main.zip)  
Extract the zip and open the `spotify-playlist-similarity-checker` folder.  
  
You need to have at least node.js version 14.15.0 installed: [Download](https://nodejs.org)  
To get your version number (if you already have node installed) type `node --version` in your console or terminal.  

&nbsp; 

## Setup:
Open a console window or terminal in the current folder.  
Run the command `npm install` and wait for it to complete. This will install all necessary packages for the script.  
  
Head over to the [Spotify Documentation website](https://developer.spotify.com/console/get-playlist-tracks), click on the 'GET TOKEN' button at the bottom, check the 'playlist-read-private' checkbox and click 'REQUEST TOKEN'.  
After the page reloaded, copy the token which is now in the text box at the bottom.  
  
Open the `config.json` with a text editor.  
  
Paste the key into the `oAuthToken` key brackets.  
> Note: The key expires every few minutes so you have to re-request the token the next time.  
> I might look into requesting the key automatically in the future.  
  
Copy the Share Link of your playlist by right clicking the playlist in your Spotify Desktop App and selecting Share > Copy Link.  
Copy the playlist ID from the link, between the last slash and the question mark:  
`https://open.spotify.com/playlist/{this_is_the_id_to_copy}?si=some_random_bullshit_we_can_ignore`  
  
Paste the playlist ID into the `playlistID` key brackets.  
  
&nbsp; 

## Starting
You can now start the script by executing in the terminal:  
`node index`  
  
The script will fetch all songs and then compare them.  
The full output will also be saved in the `output.txt` file, which might make looking at the results easier for you.  
  
&nbsp; 
  
## Config
Documentation of config settings:  
- playlistID (String): Spotify playlist ID of the playlist to fetch
- oAuthToken (String): Spotify oAuthToken to authorize this script to access the Spotify API (see setup above request)
- fetchDelay (Number): Time in ms to wait between each 100 songs requested from the Spotify API. Default: 500
- ignoreSimilarityBelowPerc (Number): Similarities below this percentage value will be ignored. Default: 90
  
The similarity of two artist - song title pairs is measured with the [Jaro-Winkler distance](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance).  