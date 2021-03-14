// const { listen } = require("engine.io");

// const { listen } = require("engine.io");

// Gregory Polmatier
var socket = io();

// timer
const ALLOTED_TIME = 60;

var timer = null;
var timeLeft = ALLOTED_TIME;

var t1score = 0;
var t2score = 0;

var t1scoreBoard = null;
var t2scoreBoard = null;

var randomWord = null;
var words = [];

var fileNum = 0;
var teamNum = 0;
var myname = null;

var t1Canvases = [];
var t2Canvases = [];

var t1_r = [];
var t2_r = [];

var totalCanvi = 0;

// Draw on Canvas Starter Code From:
// https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
var canvas, guessCanvas, guessCTX, ctx, flag = false,
    drawStartX = 0,
    drawCurrentX = 0,
    drawStartY = 0,
    drawCurrentY = 0,
    isSingleDot = false;

var color = "black",
    strokeWidth = 2;

function reset() {
    timer = null;
    timeLeft = ALLOTED_TIME;

    t1score = 0;
    t2score = 0;

    words = [];

    fileNum = 0;
    teamNum = 0;
    myname = null;

    t1Canvases = [];
    t2Canvases = [];

    t1_r = [];
    t2_r = [];

    totalCanvi = 0;
    document.getElementById("phase2").style.display = "none";
    document.getElementById("drawer").style.display = "none";
    document.getElementById("guesser").style.display = "none";
    document.getElementById("results").style.display = "none";
    document.getElementById("teamSelect").style.display="none";

    randomWord.innerHTML = "";
    erase();
    var tables = document.querySelectorAll("table");
    console.log(tables);
    tables.forEach(t => resetTable(t));
}

function init() {
    document.getElementById("startButton").style.display = "none";
    t1scoreBoard = document.getElementById("t1score");
    t2scoreBoard = document.getElementById("t2score");

    randomWord = document.getElementById("randomWord");
    // testing
    // document.getElementById("teamSelect").style.display = "none";

    document.getElementById("phase2").style.display = "none";
    document.getElementById("drawer").style.display = "none";
    document.getElementById("guesser").style.display = "none";
    document.getElementById("results").style.display = "none";


    /* canvas stuff */
    canvas = document.getElementById('paintCanvas');
    guessCanvas = document.getElementById('displayCanvas');
    guessCTX = guessCanvas.getContext("2d");
    ctx = canvas.getContext("2d");

    // Not used
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (event) {
        findxy('move', event)
    }, false);
    canvas.addEventListener("mousedown", function (event) {
        findxy('down', event)
    }, false);
    canvas.addEventListener("mouseup", function (event) {
        findxy('up', event)
    }, false);
    canvas.addEventListener("mouseout", function (event) {
        findxy('out', event)
    }, false);
    /********************************/

    document.getElementById("startButton").onclick = function() {
        socket.emit("startHit");
    };

    document.getElementById("correct").onclick = function() {
        socket.emit("correct", sendEntry(false), canvas.toDataURL());
        randomWord.innerHTML = words.pop();
    };

    document.getElementById("skipButton").onclick = function() {
        socket.emit("skip", sendEntry(true), canvas.toDataURL());
        randomWord.innerHTML = words.pop();
    };
}

function sendEntry(skip) {
    var entry = {
        'word': randomWord.innerHTML,
        'guesses': makeArrayFromUL("guessList").join(', '),
        'skipped': String(skip),
        'filename': String(fileNum++)
    };
    console.log(entry);
    return entry;
}

socket.on("clear", function() {
    console.log("clear");
    clearUL("guessList");
    erase();
});

function addTeamList(team, list) {
    console.log("addTeamList");
    team.forEach(function(player) {
        var entry = document.createElement('li');
        entry.draggable = "true";
        entry.class = "dropzone";

        entry.id = player.name;
        entry.appendChild(document.createTextNode(player.name));
        list.appendChild(entry);
    });
}

// https://stackoverflow.com/questions/7271490/delete-all-rows-in-an-html-table
function resetTable(table) {
    var tableHeaderRowCount = 1;
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
}

socket.on("showStart", function() {
    console.log("showstart");
    document.getElementById("startButton").style.display = "inline";
});

socket.on("startGame", function(ws, drawSockets) {
    console.log("client game started");
    // hide team select and show appropriate phase II
    reset();
    document.getElementById("phase2").style.display = "inline";
    

    if (drawSockets.includes(socket.id)) {
        document.getElementById("drawer").style.display = "inline";
    } else {
        document.getElementById("guesser").style.display = "inline";
    }

    // set words
    document.getElementById("timer").innerHTML = `Time Remaining: ${ALLOTED_TIME}`;

    // start timer
    timer = setInterval(countDown, 1000);

    // get words
    words = ws;

    randomWord.innerHTML ="";

    if (drawSockets.includes(socket.id)) {
        // display drawer div
        document.getElementById("drawer").style.display = "inline";
        randomWord.innerHTML = words.pop();
    } else {
        // if guesser
        document.getElementById("guesser").style.display = "inline";
    }
});

function submitGuess() {

    // get guess
    var guess = document.getElementById("guessText").value;

    // send guess to server
    console.log("submitguess client:", guess);
    socket.emit("newGuess", guess);

    //clear guess
    guess.innerHTML = "";
}

socket.on("guessAttempt", function (guess) {
    console.log("guessattempt client", guess);

    list = document.getElementById("guessList");
    var entry = document.createElement('li');
    entry.class = "guess";
    entry.id = guess;
    entry.appendChild(document.createTextNode(guess));
    list.appendChild(entry);
});

socket.on("updateScore", function(t1s, t2s) {
    console.log("updateScore");

    t1scoreBoard.innerHTML = t1s;
    t2scoreBoard.innerHTML = t2s;

    // clear
});

socket.on("newDraw", function(dsx, dsy, dcx, dcy, coler) {
    console.log("newDraw");

    drawStartX = dsx;
    drawStartY = dsy;
    drawCurrentX = dcx;
    drawCurrentY = dcy;
    color = coler;

    guessDraw();
});

socket.on("gameSummary", function (t1_rounds, t2_rounds) {
    t1_r = t1_rounds;
    t2_r = t2_rounds;
    totalCanvi = t1_rounds.length + t2_rounds.length;

    // get all images
    console.log(t1_rounds);
    t1_rounds.forEach(entry => {
        let fname = entry['filename'];
        console.log("foreach", entry);
        request(fname,1);
    });

    console.log(t2_rounds)
    t2_rounds.forEach(entry => {
        let fname = entry['filename'];
        console.log("foreach2", entry);
        request(fname,2);
    });
});


function makeTables() {
    // make table   
    let table1 = document.getElementById("t1_table");
    let table2 = document.getElementById("t2_table");

    console.log(t1Canvases, t2Canvases);
    generateTable(table1, t1_r, t1Canvases);
    // generateTableHead(table1, data1);
    console.log("got past generate table 1");

    generateTable(table2, t2_r, t2Canvases);
    // generateTableHead(table2, data2);
    console.log("got past generate table 2");
}

//   https://www.valentinog.com/blog/html-table/
function generateTable(table, data, canvi) {
    for (let element of data) {
        console.log("element", element);
        let row = table.insertRow();
        for (key in element) {
            console.log("key:", key);
            let cell = row.insertCell();
            if (key == "filename") {
                console.log("canvi", canvi);
                console.log("at zero", canvi[0]);
                let i = canvi.shift();
                console.log('add to table', i);
                cell.appendChild(i);
            } else {
                let text = document.createTextNode(element[key]);
                cell.appendChild(text);
            }
        }
    }
}

function request(filename, tnum) {
    console.log("requested " + filename);
    socket.emit('requestImg', filename,tnum)
}

socket.on('img', function (img, tnum) {
    // console.log("received img from server: " + img);
    var canvasimg = document.createElement('img');
    canvasimg.src = img;
    // canvasimg.width = "300";
    // canvasimg.height = "400";
    // canvasimg.className = "pastCanvi"
    // canvasimg.style.border = "2px solid";
    console.log('newimg', canvasimg);
    if (tnum == 1) {t1Canvases.push(canvasimg);}
    else {t2Canvases.push(canvasimg);}
    console.log("canvas added");
    totalCanvi--;
    if (totalCanvi == 0) {
        makeTables();
    }
});

function countDown() {
    console.log("countdown");

    var time = document.getElementById("timer");
    time.innerHTML = "Time Remaining: " + --timeLeft;
    if (timeLeft == 0) {
        timeLeft = ALLOTED_TIME;
        time.innerHTML = "Time Remaining: " + timeLeft;

        clearTimeout(timer);
        document.getElementById("phase2").style.display = "none";
        document.getElementById("results").style.display = "";

        socket.emit("gameover")
    }
}

/****************** Drag code *************************/

// https://stackoverflow.com/questions/12332403/html5-ul-li-draggable
let itemBeingDragged;
let idOfDraggedItem;
let index;
let indexDrop;
let list;

function addPlayer() {
    console.log("addPlayer");   
    var list = document.getElementById("unassigned");
    var playerLI = document.createElement("LI");
    playerLI.draggable = "true";
    playerLI.className = "dropzone";

    // Change id and innerHTML to make sense
    var name = document.getElementById("name").value;
    console.log(name);
    playerLI.id = name;
    playerLI.innerHTML = name;
    list.appendChild(playerLI);
    socket.emit("setName", name);
    console.log("name sent", name);
}

function createListItem(listname, val) {
    var list = document.getElementById(listname);
    var playerLI = document.createElement("LI");
    playerLI.draggable = "true";
    playerLI.className = "dropzone";

    // Change id and innerHTML to make sense
    var name = val;
    console.log("createListItem", name);
    playerLI.id = name;
    playerLI.innerHTML = name;
    list.appendChild(playerLI);
}

function addDragItem(listname) {
    var list = document.getElementById(listname);
    var playerLI = document.createElement("LI");
    // playerLI.draggable = "false";
    playerLI.setAttribute('draggable', false);
    playerLI.className = "dropzone";
    playerLI.innerHTML = "Drag Here to Add!";
    console.log("addDragItem draggable", playerLI.draggable);
    list.appendChild(playerLI);
}

function clearUL(listname) {
    var list = document.getElementById(listname);
    console.log(list)
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
 }


socket.on('teamLists', function (team1, team2, unass) {
    clearUL("team1");
    clearUL("team2");
    clearUL("unassigned");


    console.log("teams", team1, team2, unass);

    console.log("Team 1");
    for (var i = 0; i < team1.length; i++) {
        console.log("team1", team1[i])
        createListItem("team1", team1[i]);
    }
    console.log("Team 2");
    for (var i = 0; i < team2.length; i++) {
        // console.log(team2List.children[i].innerHTML);
        console.log("team2", team2[i])
        createListItem("team2", team2[i]);
    }
    console.log("Unassigned");
    for (var i = 0; i < unass.length; i++) {
        // console.log(team2List.children[i].innerHTML);
        console.log("unass", unass[i])
        createListItem("unassigned", unass[i]);
    }
    addDragItem("team1");
    addDragItem("team2");
    // addDragItem("unassigned");
});

function makeArrayFromUL(listname) {
    var list = document.getElementById(listname);
    arr = [];

    for (var i = 0; i < list.children.length; i++) {
        var child = list.children[i];
        arr.push(child.innerHTML);
    }
    return arr;
}

function getTeamFromList(listname) {
    var list = document.getElementById(listname);
    teamlist = [];
    for (var i = 0; i < list.children.length; i++) {
        var child = list.children[i];
        console.log("draggable", child.draggable);
        if (child.draggable) {
            console.log("getTeamFromList", child.innerHTML);
            teamlist.push(child.innerHTML);
        }
    }
    return teamlist;
  }

function changeTeam() {
    team1 = getTeamFromList("team1");
    team2 = getTeamFromList("team2");
    unass = getTeamFromList("unassigned");

    socket.emit("changeTeam", team1, team2, unass);
}


document.addEventListener("dragstart", function ({ target }) {
  itemBeingDragged = target;
  idOfDraggedItem = target.id;
  list = target.parentNode.children;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i] === itemBeingDragged) {
      index = i;
    }
  }
});

document.addEventListener("dragover", function (event) {
  event.preventDefault();
});

document.addEventListener("drop", function ({ target }) {
  if (target.className == "dropzone" && target.id !== idOfDraggedItem) {
    itemBeingDragged.remove(itemBeingDragged);
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === target) {
        indexDrop = i;
      }
    }
    console.log(index, indexDrop);
    if (index > indexDrop) {
      target.before(itemBeingDragged);
    } else {
      target.after(itemBeingDragged);
    }
    changeTeam();
  }
});


function setColor(colorSelectBox) {
    switch (colorSelectBox.id) {
        case "green":
            color = "green";
            break;
        case "blue":
            color = "blue";
            break;
        case "red":
            color = "red";
            break;
        case "yellow":
            color = "yellow";
            break;
        case "orange":
            color = "orange";
            break;
        case "black":
            color = "black";
            break;
        case "white":
            color = "white";
            break;
    }
    if (color == "white") strokeWidth = 14;
    else strokeWidth = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(drawStartX, drawStartY);
    ctx.lineTo(drawCurrentX, drawCurrentY);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.closePath();
    socket.emit("draw", drawStartX, drawStartY, drawCurrentX, drawCurrentY, color);
}

function guessDraw() {
    guessCTX.beginPath();
    guessCTX.moveTo(drawStartX, drawStartY);
    guessCTX.lineTo(drawCurrentX, drawCurrentY);
    guessCTX.strokeStyle = color;
    guessCTX.lineWidth = strokeWidth;
    guessCTX.stroke();
    guessCTX.closePath();
}

function erase() {
    // var m = confirm("Want to clear");
    // if (m) {
    ctx.clearRect(0, 0, w, h);
    guessCTX.clearRect(0, 0, w, h);
    // document.getElementById("canvasimg").style.display = "none"; 
    // }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        drawStartX = drawCurrentX;
        drawStartY = drawCurrentY;
        drawCurrentX = e.clientX - canvas.offsetLeft;
        drawCurrentY = e.clientY - canvas.offsetTop;

        flag = true;
        isSingleDot = true;
        if (isSingleDot) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(drawCurrentX, drawCurrentY, 2, 2);
            ctx.closePath();
            isSingleDot = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            drawStartX = drawCurrentX;
            drawStartY = drawCurrentY;
            drawCurrentX = e.clientX - canvas.offsetLeft;
            drawCurrentY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
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


function send() {
    var dataURL = canvas.toDataURL();
    console.log("send image " + dataURL);
    socket.emit('img', dataURL, filename);
}

function newRound() {
    socket.emit('newRound');
}

function restart() {
    socket.emit("restartGame");
}

socket.on("refresh", function() {
    location.reload();
});
    
