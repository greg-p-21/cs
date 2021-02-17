const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 15394; // 15394 is the port number (you'll change this to the last 5 digits of your alpha)

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// app.get('/dog.jpg', function (req, res) {
//     res.sendFile(__dirname + '/dog.jpg');
// });

app.get('/client.js', function (req, res) {
    res.sendFile(__dirname + '/client.js');
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});
//app.use(express.static('public'));

// https://www.freefavicon.com/category/great-favicons/
app.get('/favicon.jpeg', function (req, res) {
    res.sendFile(__dirname + '/favicon.jpeg');
});

// var counter = 0; // stored server side
// var scores = {}; // 
var players = [];
io.on('connection', function (socket) {

    // On New Connection
    console.log(`${socket.id} connected from ${socket.request.connection.remoteAddress}`);
    // io.emit("update", counter); // send current count to new users
    // scores[socket.id] = 0;
    players.push({
        "id": socket.id, 
        "score": 0,
        "name": "none"
    });

    // Event Listeners 'clicked'
    socket.on('clicked', function () { // receive message "clicked" with arg amount (counter from client)
        // counter++;
        // scores[socket.id]++;
        players
        if (players[socket.id]) {
            console.log(`server received ${players[socket.id]}'s ${scores[socket.id]} click`);
        } else {
            console.log(`server received ${socket.id}'s ${scores[socket.id]} click`);
        }
        io.emit('update', counter); // send message "update" with arg amount
    });


    // Event Listeners 'nameFromMe'
    socket.on('getName', function (n) {
        console.log("name is " + n);
        players.filter(player => player["id"] === socket.id).forEach(player => player["name"] = n)
        console.log(players);
        io.emit('update', players);
    });
    // Event Listeners 'disconnect'
    socket.on('disconnect', function () {
        console.log(`${socket.id} disconnected!`);
        // delete players[socket.id];
    });
});


http.listen(port, '0.0.0.0', function () {
    console.log('Listening on port ' + port);
});
