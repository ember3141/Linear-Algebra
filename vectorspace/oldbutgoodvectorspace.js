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
            stroke(color(255, 100, 100));
            strokeWeight(2);
            line(0, 0, m0.x, m0.y);
            
            // Draw arrow head for preview
            push();
            translate(m0.x, m0.y);
            rotate(m0.heading());
            fill(color(255, 100, 100));
            noStroke();
            triangle(0, 5, 0, -5, 10, 0);
            pop();
            
            // Draw matrix notation for preview
            const x0 = m0.x + 40;
            const y0 = m0.y;
            drawBrackets(x0, y0);
            fill(255);
            noStroke();
            textSize(16);
            textAlign(CENTER, CENTER);
            text(m0.x.toFixed(0), x0 + 7, y0 - 7);
            text((-m0.y).toFixed(0), x0 + 7, y0 + 10);
            textSize(14);
            break;
            
        case 1:
            v1.drawWithMatrix(color(255, 100, 100));
            resetMatrix();
            fill(255);
            noStroke();
            text("Click to set the blue vector", width / 2, 25);
            translate(width / 2, height / 2);
            
            const m1 = mouseVec();
            stroke(color(100, 150, 255));
            strokeWeight(2);
            line(0, 0, m1.x, m1.y);
            
            // Draw arrowhead for preview
            push();
            translate(m1.x, m1.y);
            rotate(m1.heading());
            fill(color(100, 150, 255));
            noStroke();
            triangle(0, 5, 0, -5, 10, 0);
            pop();
            
            // Draw matrix notation for preview
            const x1 = m1.x + 40;
            const y1 = m1.y;
            drawBrackets(x1, y1);
            fill(255);
            noStroke();
            textSize(16);
            textAlign(CENTER, CENTER);
            text(m1.x.toFixed(0), x1 + 7, y1 - 7);
            text((-m1.y).toFixed(0), x1 + 7, y1 + 10);
            textSize(14);
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
                textSize(22);
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
            text("(" + m.x.toFixed(0) + ", " + (-m.y).toFixed(0) + ")", m.x, m.y - 20);
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
    
    draw(col) {
        const tail = this.offset;
        const tip = p5.Vector.add(this.offset, this.vec);
        
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
        triangle(0, 5, 0, -5, 10, 0);
        pop();
    }
    
    drawWithMatrix(col) {
        this.draw(col);
        const tip = p5.Vector.add(this.offset, this.vec);
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
        const tip = p5.Vector.add(this.offset, this.vec);
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