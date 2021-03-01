var express = require("express");
var app = express();

app.get('/lyrics/:artist/:song', function(req, res) {
    const artist = req.params.artist;
    const song = req.params.song;

    var axios = require("axios").default;

    var options = {
        method: 'GET',
        url: 'https://mourits-lyrics.p.rapidapi.com/',
        params: { artist: artist, song: song },
        headers: {
            'x-rapidapi-key': '[your api key]',
            'x-rapidapi-host': 'mourits-lyrics.p.rapidapi.com'
        }
    };

    /* response format
    {
        "success": true,
        "result": {
            "lyrics": "Tommy used to work on the docks...",
            "source": {
                "name": "SongMeanings",
                "homepage": "https://songmeanings.com/",
                "url": "https://songmeanings.com/songs/view/11236/"
            }
        },
        "artist": "Bon Jovi",
        "song": "Livin' On A Prayer"
    } 
    */

    axios.request(options).then(function(response) {
        console.log(response.data.result.lyrics);
        res.send(response.data.result.lyrics);
    }).catch(function(error) {
        console.error(error);
        res.send("error connecting to the lyrics api");
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});