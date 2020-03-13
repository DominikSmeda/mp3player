
const http = require('http');

const fs = require("fs")
const path = require('path');
const qs = require("querystring");

const playlist = {
    songs: [],
    add(album, title) {
        let size = fs.statSync(path.join(__dirname, 'static', 'albums', album, title)).size;

        for (let song of this.songs) {
            if (song.title == title && song.album == album) {
                return;
            }
        }
        this.songs.push({ album, title, size });
    },

    getSongs() {
        return this.songs;
    },

    delete(album, title) {
        for (let [i, song] of this.songs.entries()) {
            if (song.title == title && song.album == album) {
                console.log(song);
                this.songs.splice(i, 1);
            }
        }
    }
}

const server = http.createServer((req, res) => {
    switch (req.method) {
        case "GET":
            console.log(req.url);

            if (req.url == '/') {


                fs.readFile("static/index.html", function (err, data) {
                    if (err) {
                        console.log(err);

                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                })
            }
            //GET ALBUM COVER
            else if (req.url.includes('/album-cover/')) {

                let dir = decodeURI(req.url.replace('/album-cover/', ''));
                fs.readFile(path.join(__dirname, 'static', 'albums', dir, 'cover.jpg'), (err, cover) => {
                    if (err) {
                        fs.readFile(path.join(__dirname, 'static', 'images', 'sample-cover.jpg'), (err, cover) => {
                            if (err) {
                                res.writeHead(404, 'Cant Find asset');
                                res.end();
                            }
                            else {
                                res.writeHead(200);
                                res.end(cover);
                            }
                        })

                    }
                    else {
                        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                        res.end(cover);
                    }
                });
            }

            else {
                req.url = decodeURI(req.url);
                fs.readFile(path.join(__dirname, 'static', req.url), function (err, data) {

                    if (err) {
                        res.writeHead(404, 'Cant Find asset');
                        res.end();
                        return;
                    }
                    switch (path.extname(req.url)) {
                        case '.html':
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            break;

                        case '.css':
                            res.writeHead(200, { 'Content-Type': 'text/css' });
                            break;

                        case '.js':
                            res.writeHead(200, { 'Content-Type': 'application/javascript' });
                            break;
                        case '.mp3':
                            res.writeHead(200, { "Content-type": "audio/mpeg" });
                            break;
                    }

                    res.write(data);
                    res.end();
                })

            }
            break;


        case "POST":

            var allData = "";

            req.on("data", function (data) {
                allData += data;
            })


            req.on("end", function (data) {
                PostRouter(qs.parse(allData));
            })

            function PostRouter(data) {
                switch (req.url) {
                    case '/': {

                        readAlbums().then(albums => {
                            readSongsFromAlbum(albums[0]).then(songs => {
                                let odp = {
                                    type: 'load-all-albums',
                                    albums,
                                    currentAlbum: albums[0],
                                    songs
                                }
                                res.end(JSON.stringify(odp, null, 4));
                            })
                        })
                        break;
                    }

                    case '/select-album': {
                        readSongsFromAlbum(data.album)
                            .then(songs => {
                                res.end(JSON.stringify({ type: 'select-album', songs, currentAlbum: data.album }));

                            })
                            .catch(err => {
                                // console.log(err);
                                console.log('nie ma takiego albumu');

                            });

                        break;
                    }

                    case '/playlist-add': {
                        playlist.add(data.song.split('/')[0], data.song.split('/')[1]);
                        res.end();
                        break;
                    }

                    case '/playlist-get': {
                        res.end(JSON.stringify({ type: 'select-album', songs: playlist.getSongs() }));
                        break;
                    }

                    case '/playlist-delete': {
                        playlist.delete(data.song.split('/')[0], data.song.split('/')[1]);
                        res.end();
                        break;
                    }
                }
            }

            break;

        default:
            res.end();
            break;
    }
});


server.listen(3000, () => {
    console.log('3000');

});

function readAlbums() {
    return new Promise((resolve, reject) => {

        fs.readdir(path.join(__dirname, 'static', 'albums'), function (err, files) {
            if (err) {
                reject(err);
            }
            let albums = [];
            files.forEach(function (album) {
                albums.push(album);


            });
            resolve(albums)


        });

    })
}

function readSongsFromAlbum(album) {
    return new Promise((resolve, reject) => {

        fs.readdir(path.join(__dirname, 'static', 'albums', album), function (err, files) {
            if (err) {
                reject(err);
            }
            let songs = [];
            files.forEach(function (song) {
                if (path.extname(song) == '.mp3') {
                    var stats = fs.statSync(path.join(__dirname, 'static', 'albums', album, song));
                    songs.push({ title: song, size: stats.size });
                }

            });
            resolve(songs)


        });

    })
}



