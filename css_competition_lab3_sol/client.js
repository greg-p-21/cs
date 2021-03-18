const ALLOTED_TIME = 30;
// var targetsHit = 0; // Scores are now stored on the server
var timeLeft = ALLOTED_TIME;
var gameMode = "click";

var move_timer = null;
var game_timer = null;

var myName = "";

var isPlaying = false;
var socket = io();
var seed = 0;

const MOVE_INTERVAL = 1000;
const NAVIGATION_PANEL_WIDTH = 200;
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

window.onload = init

async function init() {

    // Hide/Show Initial Divs
    document.getElementById("gameDiv").style.display = "none";
    document.getElementById("target").style.display = "none";
    document.getElementById("enterNameDiv").style.display = "none";

    console.log("starting to sleep")

    // DISPLAY LOADING ANIMATION HERE




    // Sleep
    // https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
    await new Promise(r => setTimeout(r, 5000));

    console.log("waking up")



    document.getElementById("enterNameDiv").style.display = "block";
    // SET UP TIMER
    document.getElementById("timer").innerHTML = `Time Remaining: ${ALLOTED_TIME}`

    // BACKGROUND
    var wall = document.getElementById("wall");
    wall.style.cursor = 'none';
    wall.style.height = window.innerHeight;
    wall.style.width = window.innerWidth - NAVIGATION_PANEL_WIDTH;

    // TARGET
    var target = document.getElementById("target");
    target.style.cursor = 'crosshair';
    target.setAttribute("cx", window.innerWidth / 2);
    target.setAttribute("cy", window.innerHeight / 2);

    target.onclick = function () {
        if (isPlaying && gameMode == 'click') {
            hitTarget();
        }
    }
    target.addEventListener('mouseover', function () {
        if (isPlaying && gameMode == 'mouseover') {
            hitTarget();
        }
    });

    // CURSOR
    document.addEventListener("mousemove", function (event) {
        var cursor = document.getElementById("cursor");
        cursor.setAttribute("cx", event.clientX - NAVIGATION_PANEL_WIDTH);
        cursor.setAttribute("cy", event.clientY);
    });
}


// vvvvvvvvvvvvvvvvvvvvv   Setting Name   vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
function submitName() {
    myName = document.getElementById("name").value;
    isPlaying = true;

    document.getElementById("enterNameDiv").style.display = "none";
    document.getElementById("gameDiv").style.display = "block";

    socket.emit('setName', myName);
}

socket.on('allNames', function (players) {
    addPlayersToScoreboard(players)
});

// vvvvvvvvvvvvvvvvvvvvv   SCORE BOARD vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

// Received Updated Scores From Server
socket.on('scoreUpdate', function (players) {
    updateScoreboard(players)
});

function updateScoreboard(players) {
    var sb_OL = document.getElementById("scoreboardList")
    var playersOnScoreboard = sb_OL.children.length - 1;

    for (var i = 0; i < players.length; i++) {
        var scoreListItem = document.getElementById(`scoreListItem_${i + 1}`)
        scoreListItem.innerHTML = getScoreString(players[i])
    }
}
function getScoreString(player) {
    if (player.score == -1) {
        return `${player.name}: disconnected`
    }
    var nameAndScore = getNameAndScore(player);

    if (player.name == myName) {
        return `<b>${nameAndScore}</b>`
    }
    return `${nameAndScore}`
}

function getNameAndScore(player) {
    return `${player.name}: ${player.score}`
}
function addPlayersToScoreboard(players) {

    var sb_OL = document.getElementById("scoreboardList")
    // (length - 1) since lh (list header) counts as 1 and we only want # of players
    var playersOnScoreboard = sb_OL.children.length - 1;

    // Players are missing from scoreboard
    while (players.length > playersOnScoreboard) {
        // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_li_create
        console.log(`list has ${sb_OL.children.length} children`)
        var sb_LI = document.createElement("LI")
        var li_text;

        if (players[playersOnScoreboard].name == myName) {
            sb_LI.innerHTML = `<b>${players[playersOnScoreboard].name}</b>`
        } else {
            sb_LI.innerHTML = `${players[playersOnScoreboard].name}`
        }

        sb_LI.setAttribute("id", `scoreListItem_${sb_OL.children.length}`)
        sb_OL.appendChild(sb_LI)

        playersOnScoreboard = sb_OL.children.length - 1;
    }
}

// vvvvvvvvvvvvvvvvvvvvv   Start Stop Messages   vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
function sendStart() {
    socket.emit('start');
}

// Receive Start From Server
socket.on('startedBy', async function (players, player, randomSeed) {

    document.getElementById("wall").style.backgroundColor = "red"

    toggleStartButton();

    // https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
    await new Promise(r => setTimeout(r, 2000)); // sleep(2 seconds)

    updateScoreboard(players)

    document.getElementById("wall").style.backgroundColor = "#edffab"
    document.getElementById("target").style.display = "block"

    if (isPlaying) {
        seed = randomSeed;

        radio1.disabled = true;
        radio2.disabled = true;

        move_timer = window.setInterval(moveTarget, MOVE_INTERVAL);
        game_timer = window.setInterval(countDown, 1000);
    }

});

function sendStop() {
    socket.emit('stop')
}

// Receive Stop From Server
socket.on('stoppedBy', function (player) {
    stop()
})

function stop() {
    clearTimeout(move_timer);
    clearTimeout(game_timer);

    // hide target
    document.getElementById("target").style.display = "none"
    console.log("stop");

    toggleStartButton()

}

function toggleStartButton() {
    var startBtn = document.getElementById("start");
    if (startBtn.innerHTML == "Start") {
        startBtn.innerHTML = "Stop"
        startBtn.onclick = sendStop
    } else {
        startBtn.innerHTML = "Start"
        startBtn.onclick = sendStart
    }
}


// vvvvvvvvvvvvvvvvvvvvv   Changing Game Modes   vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
function changeMode(radio) {
    socket.emit('gameMode', radio.value)
}

socket.on('newGameMode', function (mode) {
    var button;
    switch (mode) {
        case "click":
            button = document.getElementById("radio1")
            break;
        case "mouseover":
            button = document.getElementById("radio2")
            break;
    }
    button.checked = true;
    gameMode = mode;
})

// vvvvvvvvvvvvvvvvvvvvv   Target   vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
function hitTarget() {
    moveTarget();
    clearTimeout(move_timer);
    move_timer = window.setInterval(moveTarget, MOVE_INTERVAL);

    // Server will know who it was based on the socket.id
    socket.emit('hitTarget');
}

function moveTarget() {
    var target = document.getElementById("target");
    target.setAttribute("cx", getRandom(0, MAX_WIDTH));
    target.setAttribute("cy", getRandom(0, MAX_HEIGHT));
}

// http://indiegamr.com/generate-repeatable-random-numbers-in-js/
function getRandom(min, max) {
    max = max || 1;
    min = min || 0;

    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280.0;

    return min + rnd * (max - min);
}

function countDown() {
    var time = document.getElementById("timer");
    time.innerHTML = "Time Remaining: " + --timeLeft;
    if (timeLeft == 0) {
        clearTimeout(move_timer);
        timeLeft = ALLOTED_TIME;
        time.innerHTML = "Time Remaining: " + timeLeft;
        radio1.disabled = false;
        radio2.disabled = false;
        stop();

        socket.emit("gameover")
    }
}


