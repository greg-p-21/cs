const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs')
const port = process.env.PORT || 15394;


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/client.js', function (req, res) {
    res.sendFile(__dirname + '/client.js');
});
app.get('/dino.ico', function (req, res) {
    res.sendFile(__dirname + '/dino.ico');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});

var players = [];

// I used a class but you could have used arrays, associative arrays, or something else
class Player {
    constructor(socketID, name, score) {
        this.socketID = socketID;
        this.name = name;
        this.score = score;
        this.active = true;
    }
}

function sanitize (str) {
	return str.replace(/[^\w-_. ]/gi, function (c) {
		return `&#${c.charCodeAt(0)};`;
	}).replace(/javascript:/gi, '');
}

io.on('connection', function (socket) {
    // console.log(socket.id + "connected!");

    socket.on('setName', function (name) {
        // Add to players array

        var cleanName = sanitize(name);

        console.log("name: " + name + " clean name " + cleanName);

        players.push(new Player(socket.id, cleanName, 0))

        io.emit('allNames', players)
    });

    socket.on('start', function () {
        var randomSeed = Math.floor(Math.random() * 100)
        // https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
        var playerWhoClickedStart = players.find(player => player.socketID === socket.id).name;
        io.emit('startedBy', players, playerWhoClickedStart, randomSeed);
    });

    socket.on('stop', function () {
        // https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
        var playerWhoHitStop = players.find(player => player.socketID === socket.id)
        io.emit('stoppedBy', playerWhoHitStop)
    });

    socket.on('gameMode', function (gameMode) {
        // Game mode updated
        io.emit('newGameMode', gameMode)
    });

    socket.on('hitTarget', function () {
        // https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
        var playerWhoHitTarget = players.find(player => player.socketID === socket.id)
        playerWhoHitTarget.score++

        sortPlayers()

        io.emit('scoreUpdate', players);
    });

    socket.on('gameover', function () {
        console.log("server got gameover")
        if (players[0].score != 0) {
            // https://stackoverflow.com/questions/10645994/how-to-format-a-utc-date-as-a-yyyy-mm-dd-hhmmss-string-using-nodejs
            appendToFile("highscores.txt", `${players[0].name} - ${players[0].score} @ ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n`)
        }
        resetScores();

    });

    socket.on('disconnect', function () {

        var playerWhoDisconnected = players.find(player => player.socketID === socket.id)
        console.log("someone disconnected! " + socket.id + " named: " + playerWhoDisconnected);

        if (playerWhoDisconnected) {
            playerWhoDisconnected.score = -1 // sentinel value of -1 means disconnected
            playerWhoDisconnected.active = false;

            var activePlayers = players.filter(x => x.active).length
            if (activePlayers == 0) {
                clearPlayerArray()
            }
            
            sortPlayers()
            io.emit('scoreUpdate', players);
        }
    });
});

function clearPlayerArray() {
    players = []
}
function resetScores() {
    for (var i = 0; i < players.length; i++) {
        players[i].score = 0
    }
}

function appendToFile(file, data) {
    fs.appendFile(file, data, function (err) {
        if (err) console.log("ERROR writing " + data + ":" + err);
    });
}

function sortPlayers() {
    // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    players.sort((a, b) => (a.score < b.score) ? 1 : -1);
}

http.listen(port, '0.0.0.0', function () {
    console.log('Listening on port ' + port);
});
