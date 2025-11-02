let step = 0; //first set red then set blue then do the animation then scale demo
let v1, v2;

function setup() {
    createCanvas(800, 600);
    angleMode(DEGREES);
    textAlign(CENTER, CENTER);
    textSize(14);
}

function draw() {
    background(10);
    translate(width / 2, height / 2);
    stroke(100);
    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);
    
    switch (step) {
        case 0:
            resetMatrix();
            fill(255);
            noStroke();
            text("Click to set the red vector", width / 2, 25);
            translate(width / 2, height / 2);
            
            const m0 = mouseVec();
            // Draw preview using helper
            drawPreviewVector(m0, color(255, 100, 100));
            break;
            
        case 1:
            v1.drawWithMatrix(color(255, 100, 100));
            resetMatrix();
            fill(255);
            noStroke();
            text("Click to set the blue vector", width / 2, 25);
            translate(width / 2, height / 2);
            
            const m1 = mouseVec();
            // Draw preview using helper
            drawPreviewVector(m1, color(100, 150, 255));
            break;
            
        case 2:
            const dist = p5.Vector.dist(v2.offset, v1.vec);
            const t = dist > 7 ? 0.05 : 0.15;
            v2.offset.lerp(v1.vec, t);
            
            v1.drawWithMatrix(color(255, 100, 100));
            v2.drawWithMatrix(color(100, 150, 255));
            
            if (dist < 2) {
                v2.offset = v1.vec.copy();
                step = 3;
            }
            break;
        case 3:

            v1.drawWithMatrix(color(255, 100, 100));
            v2.drawWithMatrix(color(100, 150, 255));
            
            
            const tip2 = v2.tip();
            push();
            fill(255);
            noStroke();
            textSize(16);
            textAlign(CENTER, BOTTOM);
            text("place your mouse here", tip2.x - textWidth("place your mouse here") / 2, tip2.y - 10);

            circle(tip2.x, tip2.y, -sin(frameCount * 15) * 7 + 7);
            pop();

            const cursor = mouseVec();
            if (p5.Vector.dist(cursor, tip2) <= 5) {
                step = 4;
            }

            break;            
        case 4:
            // Solve s1*v1_original + s2*v2_original = mouse using Cramer's rule
            const m = mouseVec();
            const det = v1.original.x * v2.original.y - v1.original.y * v2.original.x;
            
            if (abs(det) > 0.001) {
                // Cramer's rule
                const s1 = (m.x * v2.original.y - m.y * v2.original.x) / det;
                const s2 = (v1.original.x * m.y - v1.original.y * m.x) / det;
                
                v1.setScale(s1);
                v2.setScale(s2);
                v2.offset = v1.vec.copy();
            } else {
                push();
                textSize(30);
                fill('orange');
                text("vectors are parallel !!! click to reset", 0, 0);
                pop();
            }
            
            v1.drawWithScaleAndMatrix(color(255, 100, 100));
            v2.drawWithScaleAndMatrix(color(100, 150, 255));
            
            // Draw mouse coordinates as ordered pair (x, y) at cursor
            fill(255);
            noStroke();
            textSize(16);
            textAlign(CENTER, CENTER);
            text("(" + m.x.toFixed(0) + ", " + (-m.y).toFixed(0) + ")", m.x-35, m.y-15);
            textSize(14);
            
            resetMatrix();
            fill(255);
            noStroke();
            text("Move mouse to scale vectors. Click to reset.", width / 2, 25);
            translate(width / 2, height / 2);
            break;
    }
}

function mousePressed() {
    switch (step) {
        case 0:
            v1 = new Vector(mouseVec());
            step = 1;
            break;
        case 1:
            v2 = new Vector(mouseVec());
            step = 2;
            break;
        case 2:
            break;
        case 3:
            step++;
            break;
        default:
            step = 0;
            v1 = v2 = undefined;
            break;
    }
}

// Vector class with prototype methods
class Vector {
    constructor(tip) {
        this.vec = tip.copy();
        this.original = tip.copy();
        this.offset = createVector(0, 0);
        this.scale = 1;
    }
    
    setScale(s) {
        this.vec = p5.Vector.mult(this.original, s);
        this.scale = s;
        this.offset = createVector(0, 0);
    }

    tip() {
        return p5.Vector.add(this.offset, this.vec);
    }
    
    draw(col) {
    const tail = this.offset;
    const tip = this.tip();
        
        // Draw line
        stroke(col);
        strokeWeight(3);
        line(tail.x, tail.y, tip.x, tip.y);
        
    // Arrowhead 
    push();
    translate(tip.x, tip.y);
    rotate(this.vec.heading());
    fill(col);
    noStroke();
    triangle(0, 0, -10, 6, -10, -6);
    pop();
    }
    
    drawWithMatrix(col) {
        this.draw(col);
    const tip = this.tip();
        const x = tip.x + 40;
        const y = tip.y;
        drawBrackets(x, y);
        
        fill(255);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
    text(this.vec.x.toFixed(0), x + 7, y - 7);
    text((-this.vec.y).toFixed(0), x + 7, y + 10);
        textSize(14);
    }
    
    drawWithScaleAndMatrix(col) {
        this.draw(col);
    const tip = this.tip();
    const mid = p5.Vector.add(this.offset, tip).div(2);
        const x = tip.x + 40;
        const y = tip.y;
        drawBrackets(x, y);
        
        fill(255);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
    text(this.vec.x.toFixed(0), x + 7, y - 7);
    text((-this.vec.y).toFixed(0), x + 7, y + 10);
        text(this.scale.toFixed(2) + "×", mid.x, mid.y - 20);
        textSize(14);
    }
}

function drawBrackets(x, y) {
    stroke(255);
    strokeWeight(2);
    noFill();
    
    const left = x - 20; 
    const right = x + 35;
    const top = y - 15;
    const bottom = y + 15;

    // Left bracket
    line(left, top, left, bottom);
    line(left, top, left + 5, top);
    line(left, bottom, left + 5, bottom);

    // Right bracket
    line(right, top, right, bottom);
    line(right - 5, top, right, top);
    line(right - 5, bottom, right, bottom);
}

function mouseVec() {
    return createVector(mouseX - width / 2, mouseY - height / 2);
}

// Helper to draw a preview vector (line, arrowhead, and matrix notation)
function drawPreviewVector(tip, col) {
    stroke(col);
    strokeWeight(2);
    line(0, 0, tip.x, tip.y);

    // Arrowhead (tip at 0,0; base behind at -10)
    push();
    translate(tip.x, tip.y);
    rotate(tip.heading());
    fill(col);
    noStroke();
    triangle(0, 0, -10, 6, -10, -6);
    pop();

    // matrix notation near the tip
    const x = tip.x + 40;
    const y = tip.y;
    drawBrackets(x, y);
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(tip.x.toFixed(0), x + 7, y - 7);
    text((-tip.y).toFixed(0), x + 7, y + 10);
    textSize(14);
}