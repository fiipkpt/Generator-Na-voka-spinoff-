var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
var context = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
var G = 6.67259 * 10 ** -11;

var startTime, currentTime, deltaTime = 0, lastFrameTime, scale = 1, state = 0, dtMult = 1, calcPerSec = 100;

var cBodies = /** @type {cBody[]} */ ([]);

var paths = new Array(canvas.width);
for(var i = 0; i < paths.length; i++)
{
    paths[i] = new Array(canvas.height);
}

startAnimating()

function startAnimating() {

    startTime = Date.now();
    lastFrameTime = startTime;
    currentTime = startTime;

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    currentTime = Date.now();
    deltaTime += currentTime - lastFrameTime;

    context.clearRect(0, 0, canvas.width, canvas.height);
    while (deltaTime >= 1000/calcPerSec) {
        if (!state) {
            var dt = (1/calcPerSec) * dtMult;
            cBodies.forEach((element) => { element.move(dt) });
            if(cBodies.length == 1) {
                cBodies[0].x += cBodies[0].Vx;
                cBodies[0].y += cBodies[0].Vy;
            }
            for (var i = 0; i < cBodies.length; i++) {
                for (var j = i + 1; j < cBodies.length; j++) {
                    cBodies[i].calculateVelocity(dt, cBodies[j], G);
                }
            }
        }
        deltaTime -= 1000/calcPerSec;
    }

    for(var x = 0; x < paths.length; x++)
    {
        for(var y = 0; y < paths[x].length; y++)
        {
            if(paths[x][y] == true)
            {
                context.fillStyle = "Red";
                context.fillRect(x, y, 1, 1);
            }
        }
    }

    cBodies.forEach((element) => { element.draw(context) });

    lastFrameTime = currentTime;

}

function changeScale() {
    var newScale = Number.parseFloat(document.getElementById("inputScale").value);
    if (isNaN(newScale)) {
        return;
    }
    cBodies.forEach((element) => { element.scale = newScale })
    
    for(var x = 0; x < paths.length; x++) {
        for(var y = 0; y < paths.length; y++) {
            if(paths[x][y] == true)
            {
                paths[Math.min(500, Math.max(0, Number.parseInt(x * newScale/scale)))][Math.min(500, Math.max(0, Number.parseInt(y * newScale/scale)))] = true;
                paths[x][y] = false;
            }
        }
    }
    
    scale = newScale;
    document.getElementById("scaleState").innerHTML = scale;
}

function generateNewCBody() {
    var x = Number.parseFloat(document.getElementById("inputX").value);
    var y = Number.parseFloat(document.getElementById("inputY").value);
    var Vx = Number.parseFloat(document.getElementById("inputVx").value);
    var Vy = Number.parseFloat(document.getElementById("inputVy").value);
    var m = Number.parseFloat(document.getElementById("inputM").value);

    if (isNaN(x) || isNaN(y) || isNaN(Vx) || isNaN(Vy) || isNaN(m)) {
        return;
    }

    cBodies.push(new cBody(x, y, Vx, Vy, m, scale, paths));
}

function changeState() {
    state = (state + 1) % 2;
    document.getElementById("pauseState").innerHTML = state ? "Stopped" : "Running";
}

function changeDtMult() {
    dtMult = Number.parseFloat(document.getElementById("dtMult").value);
    document.getElementById("dt").innerHTML = "dt multiplier -" + dtMult;
}

function changeCalc() {
    calcPerSec = Number.parseFloat(document.getElementById("calcSec").value);
    document.getElementById("calc").innerHTML = "Calculaitons per second - " + calcPerSec;
}
