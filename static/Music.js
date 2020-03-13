
class Music {
    constructor() {
        this.audioPlayer = $("#audio");
        this.isPlaying = false;

        this.stopIcon = new Image;
        this.stopIcon.src = "/images/player-icons/stop.png";
        this.startIcon = new Image;
        this.startIcon.src = "/images/player-icons/play.png";

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.audioElement = document.getElementById("audio");
        this.source = this.audioContext.createMediaElementSource(this.audioElement);
        this.analyser = this.audioContext.createAnalyser();
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        console.log(this.analyser.getByteFrequencyData(this.dataArray));
    }

    getData() {
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray.toString();
    }

    play() {
        this.audioPlayer.trigger("play");
        this.isPlaying = true;
        $('#play img').attr('src', this.stopIcon.src);
        $("#play img").trigger("load");
    }

    pause() {
        this.audioPlayer.trigger("pause");
        this.isPlaying = false;
        $('#play img').attr('src', this.startIcon.src);
        $("#play img").trigger("load");
    }

    stop() {
        this.audioPlayer.trigger("stop");
        console.log('ktos uzywa stop');
    }

    next() {
        let name = $('#song-name').text();

        let song = $('.song-title:contains(' + name + ')').parent().next().children('.song-title').text()
        let album = $('.song-title:contains(' + name + ')').parent().next().children('.album-title').text()
        if (song == "" || album == "") {
            song = $('.song').first().children('.song-title').text()
            album = $('.song').first().children('.album-title').text()
        }
        this.changeSong(album + "/" + song);
    }

    prev() {
        let name = $('#song-name').text();

        let song = $('.song-title:contains(' + name + ')').parent().prev().children('.song-title').text()
        let album = $('.song-title:contains(' + name + ')').parent().prev().children('.album-title').text()

        if (song == "" || album == "") {
            song = $('.song').last().children('.song-title').text()
            album = $('.song').last().children('.album-title').text()
        }
        this.changeSong(album + "/" + song);
    }

    changeSong(path, autoplay = true) {

        $('.song').removeClass('song-active')

        $('.song-title:contains(' + path.split('/')[1] + ')').parent().addClass('song-active');

        $("#audio_src").attr("src", "albums/" + path);
        $("#audio").trigger("load");

        $("#audio").on("loadeddata", () => {

            if (autoplay) {
                this.play();
            }
            else {
                this.pause();
            }

            $("#song-name").text(path.split('/')[1].replace('.mp3', ''));

        })

        $("#audio").on("timeupdate", () => {
            let size = $("#audio").prop("duration").toFixed(0);
            let currT = $("#audio").prop("currentTime").toFixed(0)
            $('#song-time').text(this.formatTime(currT) + " / " + this.formatTime(size));
            let s = currT * 100 / size;

            $('#progress #state').css({ width: s + "%" });


        });

        $("#audio").on("ended", () => {
            this.next();
        })

    }

    formatTime(time) {
        let sec = time % 60;
        let min = Math.floor(time % (1000 * 60 * 60) / 60);

        let odp = "";
        if (min < 10) odp += "0";
        odp += min + ":";
        if (sec < 10) odp += "0";
        odp += sec;
        return odp;
    }

}