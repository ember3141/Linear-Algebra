function setup(){
    createCanvas(800, 600);
    angleMode(DEGREES);
    textAlign(CENTER, CENTER);
    textSize(14);
    persist = createGraphics(width, height);
    persist.clear();
    setVectScale(-5,5,5,-5)
}

function draw(){
    background(10);
        centerOrigin();
    drawAxes();
       drawVect(createVector(4, -2), color(100, 255, 100));
    drawVect(createVector(2, -1), color(255, 100, 100));
    drawVect(createVector(1, -3), color(100, 100, 255));
 
}