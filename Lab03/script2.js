var timeToClick = 0;

function init() {
    // BACKGROUND
    var wall = document.getElementById("wall");
    wall.style.cursor = 'none';

    // TARGET
    var target = document.getElementById("target");
    target.style.cursor = 'crosshair';
    target.style.display = "none";
    target.setAttribute("cx", window.innerWidth / 2);
    target.setAttribute("cy", window.innerHeight / 2);

    target.onclick = hitTarget;

    // KEY LISTENER
    document.addEventListener('keydown', function(event) {
        if(event.key == ' ') {
            // Start Random Timer
            console.log("started timer");
            window.setTimeout(moveTarget, Math.random()*5000+500);

        }
    });
    // CURSOR
    document.addEventListener("mousemove", function (event) {
        var cursor = document.getElementById("cursor");
        cursor.setAttribute("cx", event.clientX);
        cursor.setAttribute("cy", event.clientY);
    });

}

function hitTarget() {
            // STOP TIME
            var timeDiff = new Date().getTime() - timeToClick;
            console.log("Your reaction time: " + timeDiff + "ms")
            alert("Reaction time: " + timeDiff + "ms")
}

function moveTarget() {
    var target = document.getElementById("target");
    target.style.display = "block";
    console.log("moved!")
    target.setAttribute("cx", Math.random() * window.innerWidth);
    target.setAttribute("cy", Math.random() * window.innerHeight);

    // Start Timing User
    timeToClick = new Date().getTime();
}