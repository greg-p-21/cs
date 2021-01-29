var circle = document.getElementById("circle");
var scoreDisplay = document.getElementById("score");
var clickRadio = document.getElementById('click');
var mouseRadio = document.getElementById('mouse');
var stopBtn = document.getElementById("stop");
var newMouse = document.getElementById("newMouse");
var timeDisplay = document.getElementById("time");

/*https://stackoverflow.com/questions/24386354/execute-js-code-after-pressing-the-spacebar
Used in determining how to tell when the space bar is pressed.*/

document.addEventListener('keyup', event => {
	if (event.code === 'Space') {
  	
    
    setTimeout(function() {
    	startTime = new Date().getTime();
      var timer = setInterval(function() {
        timeDisplay.innerHTML = new Date().getTime()-startTime;
      }, 10);
      
    	circle.setAttribute("cx", Math.random() * 800 + 50);
  		circle.setAttribute("cy", Math.random() * 450 + 50);
      
      circle.onclick = function() {
        clearInterval(timer);
      };
    }, Math.random() * 1000 + 1000);
    
   
  }
});




