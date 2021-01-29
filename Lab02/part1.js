var timeLeft = 30;
var circle = document.getElementById("circle");
var scoreDisplay = document.getElementById("score");
var highScore = 0;
var clickRadio = document.getElementById('click');
var mouseRadio = document.getElementById('mouse');
var stopBtn = document.getElementById("stop");
var newMouse = document.getElementById("newMouse");

/* https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onmousemove
/* Link was used to create the new cursor for the mouse*/
function mouse(e) {
  document.getElementById("gamespace").style.cursor= 'none';
  var x = e.clientX;
  var y = e.clientY;
  newMouse.setAttribute("cx", x);
  newMouse.setAttribute("cy", y-150);
} 

clickRadio.onclick = function() {
  circle.onmouseover = "none";
  circle.onclick = function() {
    scoreDisplay.innerHTML = parseFloat(scoreDisplay.innerHTML) + 1;
  };
};

mouseRadio.onclick = function() {
  circle.onclick = "none";
  circle.onmouseover = function() {
    scoreDisplay.innerHTML = parseFloat(scoreDisplay.innerHTML) + 1;
  };	
};		

function startGame() {
	var startBtn = document.getElementById("start");
  startBtn.onclick = "return false";

	var circleTimer = setInterval(moveCircle, 1000);
  
  timeLeft = 15;
  var timer = setInterval(function() {
  	if(--timeLeft > 0) {
  		document.getElementById("timer").innerHTML = timeLeft;
  	} else {
  		document.getElementById("timer").innerHTML = "0";
    	clearInterval(circleTimer); 
      highScoreCalc(parseFloat(scoreDisplay.innerHTML));
      scoreDisplay.innerHTML = 0;
 	 }
  }, 1000);
  
  
  var stopBtn = document.getElementById("stop");
  stopBtn.onclick = function(){
  	clearInterval(circleTimer); 
  	clearInterval(timer);
    startBtn.onclick = startGame;
    scoreDisplay.innerHTML = 0;
  };
}

function moveCircle() {
  circle.setAttribute("cx", Math.random() * 800 + 50);
  circle.setAttribute("cy", Math.random() * 450 + 50);
}

function runTimer(timer) {
	if(--timeLeft > 0) {
  	document.getElementById("timer").innerHTML = timeLeft;
  } else {
  	//document.getElementById("timer").innerHTML = "0";
    //clearInterval(circleTimer); 
  }
}

function highScoreCalc(newScore) {
	if(newScore > highScore) {
  	highScore = newScore;
  }
  document.getElementById("highScore").innerHTML = highScore;
}




