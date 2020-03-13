
class UI {

    constructor() {

        net.init()
            .then(data => {
                this.onDataRender(data);
                $('#audio').trigger("load");
            })
            .catch(err => {

            })

        this.stopIcon = new Image;
        this.stopIcon.src = "/images/player-icons/stop.png";
        this.startIcon = new Image;
        this.startIcon.src = "/images/player-icons/play.png";
        this.section = true;

        this.clicks();
        this.keyboard();
        this.renderAudioPlayerView();
    }


    clicks() {
        $("html, body").scrollTop(0)
        let that = this;

        $("body").on("click", function () {

            music.audioContext.resume().then(function () {
                console.log("audioContext lives!")
            })
        })

        $('#songs').on('click', '.playlist-add', function (e) {
            e.stopPropagation()
            let name = $(this).parent().children('.song-title').text();
            let album = $(this).parent().children('.album-title').text();

            net.sendData('/playlist-add', { song: album + '/' + name })
                .then(() => that.dialog('Dodano!'));
        });

        $('#songs').on('click', '.playlist-delete', function (e) {
            e.stopPropagation()
            let name = $(this).parent().children('.song-title').text();
            let album = $(this).parent().children('.album-title').text();
            music.prev();
            $(this).parent().remove();
            net.sendData('/playlist-delete', { song: album + '/' + name })
                .then(() => {
                    that.dialog('Usunięto!');
                    that.emptyPlaylist();
                });
        });

        $("#albums").on('click', '.album', function () {
            let album = $(this).find('img').attr('alt');

            net.sendData('/select-album', { album }).then(data => that.onDataRender(data));

        });

        $("#songs").on('click', '.song', function () {
            let name = $(this).find('.song-title').text();
            let path = $(this).find('.album-title').text() + '/' + name;
            music.changeSong(path);

        });

        $('#playlist-button').on('click', function () {
            net.sendData('/playlist-get', {})
                .then(data => that.onDataRender(data));
        });

        $('#audio-player').on('click', '.controls', (e) => {

            switch (e.currentTarget.id) {
                case 'play':
                    if (!music.isPlaying) {
                        music.play();

                    }
                    else {
                        music.pause();
                    }
                    break;

                case 'prev':
                    music.prev();
                    break;

                case 'next':
                    music.next();
                    break;
            }

        })



    }

    keyboard() {
        $(window).on('keydown', (e) => {
            console.log(e.key);
            switch (e.key) {
                case ' ': {
                    if (music.isPlaying) {
                        music.pause();
                    }
                    else {
                        music.play();
                    }
                    break;
                }

                case 'ArrowDown': {
                    music.next();
                    break;
                }

                case 'ArrowUp': {
                    music.prev();
                    break;
                }

                case 'ArrowRight': {

                    break;
                }

                case 'ArrowLeft': {

                    break;
                }

                case 'v': {
                    if (this.section)
                        this.scrollBottom()
                    else
                        this.scrollTop();

                    this.section = !this.section;
                    break;
                }
            }

        })
    }

    onDataRender(data) {

        if (data.type == "load-all-albums") {
            this.renderAlbumsView(data.albums);
            this.renderSongsView(data.songs, data.currentAlbum);
            this.renderFooterView(data.currentAlbum);
        }

        if (data.type == "select-album") {
            this.renderSongsView(data.songs, data.currentAlbum);
        }

    }

    renderAlbumsView(albums) {
        let albumsDiv = $('#albums');
        for (let album of albums) {
            let albumDiv = $('<div class="album">');
            let img = $(`<img class="cover" src="/album-cover/${album}" alt="${album}">`);
            let description = $(`<div class="description">`);
            description.text(album)
            albumDiv.append(img);
            albumDiv.append(description);

            albumsDiv.append(albumDiv);
        }
    }

    emptyPlaylist() {
        if ($('#songs #content').children().length == 0) {
            let songsDiv = $('#songs #content');
            songsDiv.empty();
            let div = $('<div class="empty-list">');
            div.text('Playlista jest pusta!')

            songsDiv.append(div)
        }

    }
    renderSongsView(songs, currentAlbum) {

        let songsDiv = $('#songs #content');
        songsDiv.empty();

        if (!songs.length) {
            this.emptyPlaylist();
            return;
        }

        for (let song of songs) {
            let songDiv = $('<div class="song">');

            let atitle = $(`<div class="album-title">`);
            let stitle = $(`<div class="song-title">`);
            let size = $(`<div class="song-size">`);
            size.text(Number(song.size / 1024 / 1024).toFixed(2) + 'MB');

            let addButton;
            if (currentAlbum)
                addButton = $(`<div class="playlist-add">`);
            else
                addButton = $(`<div class="playlist-delete">`);

            stitle.text(song.title);
            atitle.text(currentAlbum || song.album);

            songDiv.append(atitle);
            songDiv.append(stitle);
            songDiv.append(size);
            songDiv.append(addButton);
            songDiv.append($('<div style="clear:both">'));
            songsDiv.append(songDiv);
        }

        music.changeSong(currentAlbum + '/' + songs[0].title, false);
    }

    renderAudioPlayerView() {
        let player = $('#audio-player');
        let name = $('<div id="song-name">');
        let time = $('<div id="song-time">');
        let play = $('<div id="play" class="controls"><img src="/images/player-icons/play.png">');
        let prev = $('<div id="prev" class="controls"><img src="/images/player-icons/prev.png">');
        let next = $('<div id="next" class="controls"><img src="/images/player-icons/next.png">');
        let progress = $('<div id="progress"><div id="state">');

        player.append(progress);
        player.append(name);
        player.append(prev);
        player.append(play);
        player.append(next);
        player.append(time);

    }

    dialog(text, time = 1100) {
        let dialog = $('<div class="dialog">');
        dialog.text(text);
        $('body').append(dialog);

        dialog.fadeIn('fast').delay(time).fadeOut('fast', () => { dialog.remove() });
    }

    scrollTop() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }

    scrollBottom() {
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    }
}
