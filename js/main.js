//////////////////////
// Jacob Johnson    //
// granular-machine //
//////////////////////

var rad = 15;
var shade = 150;

var bg = [];
var dots = []

//grain globals
var att;
var dec;
var audioBuffer;

var ctx, master, cVerb, irBuff

var rate, frate;

var posX, posY;

////////////////////////////////////////////////////////////////////////////////

// "loadbang"
window.onload = function() {

    //web audio setup
    ctx = new (window.AudioContext || window.webkitAudioContext);

    //master volume
    master = ctx.createGain();
        master.connect(ctx.destination);

    //create convolution verb
    cVerb = ctx.createConvolver();
        cVerb.connect(ctx.destination);

    //get IR
    irBuff;
    var getIr = new XMLHttpRequest();
        getIr.open("get", "samples/irs/Space4ArtGallery.wav", true);
        getIr.responseType = "arraybuffer";

        getIr.onload = function() {
            ctx.decodeAudioData(getIr.response, function(buffer) {
                irBuff = buffer;
            });
        };

        getIr.send();

    var sliderRate;
    var sliderAtt;
    var sliderDec;

    //load buffer with page
    bufferSwitch(0);

    var switcher = document.getElementById("buffsel");
    switcher.addEventListener("input", function() {
        bufferSwitch(switcher.selectedIndex);
    });

    //call slider values
    setInterval( function() {
        sliderRate = document.getElementById("density").value;
        rate = parseFloat(sliderRate);
        sliderAtt = document.getElementById("attack").value;
        att = parseFloat(sliderAtt);
        sliderDec = document.getElementById("decay").value;
        dec = parseFloat(sliderDec);
    }, 50);

    document.getElementById('startButton').addEventListener('click', function() {
        ctx.resume().then(() => {
        });
    });
}

//https://stackoverflow.com/questions/10592411/disable-scrolling-in-all-mobile-devices

window.addEventListener("scroll", preventMotion, false);
window.addEventListener("touchmove", preventMotion, false);

function preventMotion(event)
{
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
}



////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

//p5.js setup
function setup() {
    //initalize grain canvas
    gcanvas = createCanvas(windowWidth, windowHeight);
    gcanvas.class("grainCanvas");
    gcanvas.parent("canvasContainer");

    for (var i = 0; i < windowWidth*1.2; i++) {
        bg.push(new Clouds());
        bg[i].seed();
    }

    for (var i = 0; i < 40; i++) {
        dots.push(new Circles());
    }

    ellipseMode(RADIUS);
    noStroke();
}

//p5.js draw
function draw() {
    //track circle movement
    posX = mouseX;
    posY = (mouseY*0.9)-(windowHeight*0.1);

    clear();

    //re-draw border post-grid
    for (var i = 0; i < bg.length; i++) {
        bg[i].draw();
    }

    //limit drawing to within canvas
    if (posX > 0 && posX < windowWidth && posY > windowHeight*0.0005 && posY < windowHeight ) {
        if (mouseIsPressed) {

            //draw circle when mouse is pressed
            for (var i = 0; i < dots.length; i++) {
                dots[i].clicked(mouseX, mouseY, rad, shade);
            }
            grans(posX, posY);
    }

    stroke(0);
    strokeWeight(4);
    noFill();
    noStroke();
    if (rate > 100) {
        frate = 100;
    } else {
        frate = rate;
    }
    frameRate(frate);
    }
}

////////////////////////////////////////////////////////////////////////////////

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function Circles() {
    this.clicked = function(x, y, startRad, color) {
        this.x = x + rand(-30, 30);
        this.y = y + rand(-30, 30);
        fill(color, color, 255, 40);
        ellipse(this.x, this.y, startRad, startRad);
    }
}


function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

////////////////////////////////////////////////////////////////////////////////

function grans(pos, pitch) {

    var grain = ctx.createBufferSource();
    var contour = ctx.createGain();
    var verbLevel = ctx.createGain();
    var len, factor, position, randFactor;

    contour.gain.setValueAtTime(0, ctx.currentTime);
    contour.gain.linearRampToValueAtTime(0.6 * rand(0.5, 1), ctx.currentTime + att);
    contour.gain.linearRampToValueAtTime(0, ctx.currentTime + (att + dec));

    contour.connect(verbLevel);
    contour.connect(master);

    verbLevel.gain.setValueAtTime(0.6, ctx.currentTime);

    verbLevel.connect(master);

    var gRate = (5.5*(0.8 - (pitch/windowHeight)))+0.5;

    grain.buffer = audioBuffer;
    len = grain.buffer.duration;
    factor = pos;
    position = windowWidth;
    randFactor = 10;


    if (gRate < 1) {
        grain.playbackRate.value = 0.5;
    } else {
        grain.playbackRate.value = Math.floor(gRate);
    }

    grain.connect(contour);

    // grain start point = buf len * mouse position / x dimension + rand
    grain.start(ctx.currentTime, (len*factor/position)+rand(0,randFactor));

    //stop old grains
    grain.stop(ctx.currentTime + (att + dec) + 1);


    //grain enveloping and verb
}

function bufferSwitch(input) {
    var getSound = new XMLHttpRequest();
        if (input == 0) {
            getSound.open("get", "samples/audio/SH-el.mp3", true);
        } else if (input == 1) {
            getSound.open("get", "samples/audio/guitar.wav", true);
        } else if (input == 2) {
            getSound.open("get", "samples/audio/piano+spaceecho.mp3", true);
        }
        else {
            //nothing
        }
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
            ctx.decodeAudioData(getSound.response, function(buffer) {
                audioBuffer = buffer;
            });
        };
        getSound.send();
}


function Clouds() {
    this.x;
    this.y;

    this.seed = function () {
        this.x = randomGaussian(windowWidth/2, windowWidth / 2);
        this.y = randomGaussian(windowHeight/2, windowHeight / 2);
    }

    this.draw = function () {
        noStroke();
        fill(150, 50)
        ellipse(this.x, this.y, 100, 100);
    }
}

function randomX() {
    return Math.random() * windowWidth;
}

function randomY() {
    return Math.random() * windowHeight;
}
