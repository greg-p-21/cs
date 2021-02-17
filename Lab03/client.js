// Gregory Polmatier
var socket = io();

const ALLOTED_TIME = 30;
const MOVE_INTERVAL = 1000;
const COUNTDOWN_TIME = 5;

var highScore = 0;
var targetsHit = 0;
var attemptedClicks = 0;

var isPlaying = false;

var gameMode = "click";

var moveTimer = null;
var gameTimer = null;
var countDownTimer = null;

var timeLeft = ALLOTED_TIME;
var countDownLeft = COUNTDOWN_TIME;

var targetLocs = null;

function init() {

    // BACKGROUND
    var background = document.getElementById("svgBackground");
    background.style.cursor = 'none';
    background.onclick = function () {
        console.log("clicked wall");
        attemptedClicks++;
    }

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
        cursor.setAttribute("cx", event.clientX);
        cursor.setAttribute("cy", event.clientY);
    });

    // SLIDER
    var slider = document.getElementById("circleSize");
    slider.oninput = function () {
        console.log("slider");
        target.style.display = "block";
        target.setAttribute("r", slider.value);
    }

    getName();
    socket.on('update', players => {
        document.querySelector("table").innerHTML = '';
        console.log("received "+ players);
        let table = document.querySelector("table");
        let data = Object.keys(players[0]);
        generateTable(table, players);
        generateTableHead(table, data);
    });

    // recieve target locations
    socket.on('locations', function(locs) {
        targetLocs = locs;

        // start countdown and begin game
        countDownTimer = setInterval(initialCountDown, 1000);
    });

    socket.on('dis', function(n) {
        alert(`${n} has left the game!`);
        stop();
    });
}

function hitTarget() {
    console.log('target hit');
    socket.emit('targetHit', targetsHit++);
    moveTarget();
    
    console.log("score: " + targetsHit);
    var scoreboard = document.getElementById("scoreboard");
    if (gameMode == "click") {
        // scoreboard.innerHTML = "Score: " + targetsHit + "<br>Accuracy: " + (targetsHit / attemptedClicks).toFixed(2);
        scoreboard.innerHTML = `Score: ${targetsHit}<br>Accuracy: ${(targetsHit / attemptedClicks).toFixed(2)}`;
    } else {
        scoreboard.innerHTML = "Score: " + targetsHit;
    }
}

function getName() {
    var name = prompt("Enter Name", "mike");
    // console.log(name)
    socket.emit('getName', name);
}

function start() {
    // start game
    socket.emit('startGame');
}

function play() {
    console.log("play");
    // init variables
    targetsHit = 0;
    attemptedClicks = 0;
    moveTimer = window.setInterval(moveTarget, MOVE_INTERVAL);
    gameTimer = window.setInterval(countDown, 1000);

    document.getElementById("scoreboard").innerHTML = "Score: 0";
    document.getElementById("timer").innerHTML = "Score: 0";
    toggleButtons();

    isPlaying = true;
    moveTarget();
}

function stop() {
    clearTimeout(moveTimer);
    clearTimeout(gameTimer);
    console.log("stop");
    toggleButtons();
    isPlaying = false;
    if(targetsHit > highScore) {
        highScore = targetsHit;
        document.getElementById("highscore").innerHTML = "High Score: " + highScore;
    }
    alert("Final Score " + targetsHit)
    socket.emit('gameOver');
}

function toggleButtons() {
    var radio1 = document.getElementById("radio1");
    var radio2 = document.getElementById("radio2");
    var start_btn = document.getElementById("start");
    var stop_btn = document.getElementById("stop");
    var slider = document.getElementById("circleSize");

    if (isPlaying) {
        start_btn.disabled = false;
        stop_btn.disabled = true;
        slider.disabled = false;
        radio1.disabled = false;
        radio2.disabled = false;
    } else {
        start_btn.disabled = true;
        stop_btn.disabled = false;
        slider.disabled = true;
        radio1.disabled = true;
        radio2.disabled = true;
    }
}

function moveTarget(cx, cy) {
    var target = document.getElementById("target");
    target.style.display = "block";
    // target.style.display = "none";
    newTarget = targetLocs.pop()
    cx = newTarget[0];
    cy = newTarget[1];
    console.log(cx+','+cy);
    target.setAttribute("cx", cx);
    target.setAttribute("cy", cy);
}

function initialCountDown() {
    var time = document.getElementById("initialTimer");
    time.innerHTML = "Time till game starts: " + --countDownLeft;
    if (countDownLeft == 0) {
        clearTimeout(countDownTimer);
        countDownLeft = COUNTDOWN_TIME;
        time.innerHTML = '';
        play();
    }
}

function countDown() {
    var time = document.getElementById("timer");
    time.innerHTML = "Time Remaining: " + --timeLeft;
    if (timeLeft == 0) {
        clearTimeout(moveTimer);
        timeLeft = ALLOTED_TIME;
        time.innerHTML = "Time Remaining: " + timeLeft;
        stop();
    }
}

function changeMode(radio) {
    gameMode = radio.value;
}

// https://www.valentinog.com/blog/html-table/
function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
//   https://www.valentinog.com/blog/html-table/
  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
