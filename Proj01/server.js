const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs')
const port = process.env.PORT || 15394;

readFromFile("words.txt");

var readline = require('readline');

const TEAM_UN = 0;
const TEAM_1  = 1;
const TEAM_2  = 2;

var team1 = [];
var team2 = [];
var unass = [];

var team1ids = [];
var team2ids = [];

var t1drawer = null;
var t2drawer = null;

var sockets = {};

var t1score = 0;
var t2score = 0; 

var words = [];

var t1_rounds = [];
var t2_rounds = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/client.js', function (req, res) {
    res.sendFile(__dirname + '/client.js');
});
app.get('/favicon.jpeg', function (req, res) {
    res.sendFile(__dirname + '/favicon.jpeg');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});
app.get('/words.txt', function (req, res) {
    res.sendFile(__dirname + '/words.txt');
});


io.on('connection', function (socket) {
    // console.log(socket.id + "connected!");
    

    socket.on('setName', function (name) {
        // Add to players array
        unass.push(name);
        sockets[name] = socket.id;
        console.log(team1, team2, unass);
        io.emit('teamLists', team1, team2, unass);
    });

    socket.on("getInfo", function () {
        

        socket.emit("info", team_num, n);
    });

    socket.on('changeTeam', function (t1, t2, un) {
        team1 = t1;
        team2 = t2;
        unass = un;
        io.emit("teamLists", team1, team2, unass);

        console.log(team1.length, team2.length);
        if (team1.length > 1 && team2.length > 1) {
            io.emit("showStart");
        }
        team1ids = [];
        team2ids = [];

        team1.forEach(p => team1ids.push(sockets[p]));
        team2.forEach(p => team2ids.push(sockets[p]));
    });

    // PHASE 2 ******************************

    socket.on("startHit", function() {
        // get words list
        // words = Array.from(readFromFile('words.txt'));
        // readFromFile("words.txt");
        shuffleArray(words);
        console.log("words", words);

        // pick drawers
        //https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
        t1drawer = team1ids[Math.floor(Math.random() * team1ids.length)];
        t2drawer = team2ids[Math.floor(Math.random() * team2ids.length)];
        
        // emit
        io.emit("startGame", words, [t1drawer, t2drawer]);
    });

    socket.on("skip", function (entry) {
        if (socket.id === t2drawer) {
            t2_rounds.push(entry);
        } else {
            t1_rounds.push(entry);
        }

        io.emit("clear");
    })

    socket.on("correct", function(entry) {
        if (socket.id === t1drawer) {
            t1score++;
        } else {
            t2score++;
        }

        if (socket.id === t2drawer) {
            t2_rounds.push(entry);
        } else {
            t1_rounds.push(entry);
        }

        io.emit("updateScore", t1score, t2score);
        io.emit("clear");
    });

    socket.on("draw", function (dsx, dsy, dcx, dcy, color) {
        if (socket.id === t1drawer) {
            team1ids.forEach(id => io.to(id).emit("newDraw", dsx, dsy, dcx, dcy, color));
        } else {
            team2ids.forEach(id => io.to(id).emit("newDraw", dsx, dsy, dcx, dcy, color));
        }
    });

    socket.on("newGuess", function (guess) {
        console.log("newGuess server", guess);
        // console.log(team1ids, team2ids, sockets, team1);
        console.log("equal", socket.id === t1drawer, socket.id, t1drawer);
        if (team1ids.includes(socket.id)) {
            team1ids.forEach(id => io.to(id).emit("guessAttempt", guess));
        } else {
            team2ids.forEach(id => io.to(id).emit("guessAttempt", guess));
        }
    });

    socket.on("gameover", function () {
        console.log("gameover");

        socket.emit("gameSummary", t1_rounds, t2_rounds);
    });

    // Listen for image and filename
    socket.on('img', function (dataURL, filename) {
        console.log("Received image  " + dataURL)
        var base64Data = dataURL.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(filename, base64Data, 'base64', function (err) {
            console.log(err);
        });
    })

    // Send the requested file
    socket.on('requestImg', function (filename) {

        console.log("Client Requests Image " + filename)
        fs.readFile(filename, 'base64', function (err, data) {
            if (err) {
                console.log(err);
                // Might be a good idea to send a response if the file doesn't exist
                io.emit('img', "File not found")
            } else {
                io.emit('img', "data:image/png;base64," + data.toString())
            }
        });
    });

});

function readFromFile(file) {
	fs.readFile(file, function (err, data) {
		if (err) throw err;
        words = String(data).split('\n');
		console.log(words);
	});
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

http.listen(port, '0.0.0.0', function () {
    console.log('Listening on port ' + port);
});