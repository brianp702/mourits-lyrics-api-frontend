const express = require("express");
const app = express();
require('dotenv').config();

app.get('/lyrics/:artist/:song', (req, res) => {
    const artistAndSong = {
        artist: req.params.artist,
        song: req.params.song
    };

    // check mongoDB: did we already cache that song?
    const MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(process.env.MONGOCONNECTIONSTRING, { useUnifiedTopology: true })
        .then(client => {
            console.log('connected to db');
            const db = client.db('myFirstDatabase');

            db.collection('song-lyrics').findOne(artistAndSong)
                .then(results => {
                    console.log(results);

                    if (results) {
                        console.log('the song is in the db');
                        res.send(results.lyrics);
                    } else {
                        console.log('the song is not in the db. Get lyrics from mourits-lyrics api');

                        const axios = require("axios").default;
                        const options = {
                            method: 'GET',
                            url: 'https://mourits-lyrics.p.rapidapi.com/',
                            params: artistAndSong,
                            headers: {
                                'x-rapidapi-key': process.env.XRAPIDAPIKEY,
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

                        axios.request(options)
                            .then(function(response) {
                                console.log(response.data.result.lyrics);
                                artistAndSong.lyrics = response.data.result.lyrics;

                                db.collection('song-lyrics').insertOne(artistAndSong)
                                    .then(result => {
                                        console.log('song was added to db');
                                    })
                                    .catch(error => console.error(error));

                                res.send(response.data.result.lyrics);
                            }).catch(function(error) {
                                console.error(error);
                                res.send("error connecting to the lyrics api");
                            });
                    }
                })
                .catch(error => console.error(error));
        })
        .catch(console.error);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});