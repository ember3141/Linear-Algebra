let step = 0; //first set red then set blue then do the animation then scale demo
let v1, v2;
let persist; // buffer to persist drawings
let prevPersist = null; // previous mouse position 
let currentScaling = null; // vector of [s1, s2] to display 

function setup() {
    createCanvas(800, 600);
    angleMode(DEGREES);
    textAlign(CENTER, CENTER);
    textSize(14);
    persist = createGraphics(width, height);
    persist.clear();
}


function drawOuterBrackets(leftX, rightX, y) {
    stroke(255);
    strokeWeight(2);
    noFill();

    const top = y - 15;
    const bottom = y + 15;

    // Left bracket
    line(leftX, top, leftX, bottom);
    line(leftX, top, leftX + 5, top);
    line(leftX, bottom, leftX + 5, bottom);

    // Right bracket
    line(rightX, top, rightX, bottom);
    line(rightX - 5, top, rightX, top);
    line(rightX - 5, bottom, rightX, bottom);
}

function draw() {
    background(10);
    image(persist, 0, 0);
    drawMatrixDisplay();
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
            // mDisplay is the point used for display and persistent drawing; for parallel vectors ill project the actual mouse onto the line and use that projected point
            let mDisplay = m.copy();
            const det = v1.original.x * v2.original.y - v1.original.y * v2.original.x;
            
            if (abs(det) > 0.001) {
                // cramer's rule
                const s1 = (m.x * v2.original.y - m.y * v2.original.x) / det;
                const s2 = (v1.original.x * m.y - v1.original.y * m.x) / det;
                
                v1.setScale(s1);
                v2.setScale(s2);
                v2.offset = v1.vec.copy();
                currentScaling = createVector(s1, s2);
            } else {
                // Vectors are parallel. Constrain the mouse to the line spanned by v1.original
                const v = v1.original.copy();
                const denom = v.x * v.x + v.y * v.y;
                if (denom > 1e-6) {
                    // get scalar that projects m onto v: s_proj * v = projection
                    const s_proj = (m.x * v.x + m.y * v.y) / denom;

                    v1.setScale(s_proj);
                    v2.setScale(0);
                    v2.offset = v1.vec.copy();

                    // projected point (in centered coords)
                    const mproj = p5.Vector.mult(v1.original, s_proj);
                    mDisplay = mproj;
                    currentScaling = createVector(s_proj, 0);

 
                    push();
                    stroke('orange');
                    strokeWeight(1);
                    noFill();
                    line(m.x, m.y, mproj.x, mproj.y);
                    pop();

                    push();
                    textSize(18);
                    fill('orange');
                    noStroke();
                    text("vectors are parallel - we can only move in 1 dimension!", 0, 0);
                    pop();
                } else {

                    push();
                    textSize(22);
                    fill('orange');
                    text("invalid vector, click to reset", 0, 0);
                    pop();
                }
            }

      
            circle(mDisplay.x, mDisplay.y, 5);


            if (persist) {
                // convert centered coords to pixel coords for persist
                const px = mDisplay.x + width / 2;
                const py = mDisplay.y + height / 2;

                persist.push();
                persist.stroke(color(150, 255, 150));
                persist.strokeWeight(2);
                persist.strokeCap(ROUND);
                persist.strokeJoin(ROUND);

                if (prevPersist) {
                    persist.line(prevPersist.x, prevPersist.y, px, py);
                } else {
                    persist.point(px, py);
                }

                persist.pop();
                prevPersist = { x: px, y: py };
            }

            if (!currentScaling) {
                currentScaling = null;
            }
            v1.drawWithScaleAndMatrix(color(255, 100, 100));
            v2.drawWithScaleAndMatrix(color(100, 150, 255));
            
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
            // clear persistent trail and reset previous point when resetting
            if (persist) persist.clear();
            prevPersist = null;
            currentScaling = null;
            break;
    }
}

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
        drawBrackets(x, y, 20, 35);
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
        drawBrackets(x, y, 20, 35);
        
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

function drawBrackets(x, y, leftOffset = 30, rightOffset = 35) {
    stroke(255);
    strokeWeight(2);
    noFill();

    const left = x - leftOffset;
    const right = x + rightOffset;
    const top = y - 15;
    const bottom = y + 15;

    line(left, top, left, bottom);
    line(left, top, left + 5, top);
    line(left, bottom, left + 5, bottom);

    line(right, top, right, bottom);
    line(right - 5, top, right, top);
    line(right - 5, bottom, right, bottom);
}

function mouseVec() {
    return createVector(mouseX - width / 2, mouseY - height / 2);
}


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
    drawBrackets(x, y, 20, 35);
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(tip.x.toFixed(0), x + 7, y - 7);
    text((-tip.y).toFixed(0), x + 7, y + 10);
    textSize(14);
}

function drawMatrixDisplay() {
    push();
    resetMatrix();
    const colSpacing = 40; // horizontal spacing between the two matrix columns
    const x0 = 46; // center x of first column
    const bracketLeftOffset = 30; 
    const bracketRightOffset = 35; 
    const y0 = 46; // center y for brackets
    let c1 = null;
    let c2 = null;
    if (step === 0) {
        c1 = mouseVec();
        c2 = null;
    } else if (step === 1) {
        if (v1) c1 = v1.original;
        c2 = mouseVec();
    } else if (step >= 4) {
        if (v1) c1 = v1.original;
        if (v2) c2 = v2.original;
    } else {
        if (v1) c1 = v1.original;
        if (v2) c2 = v2.original;
    }

    stroke(255);
    strokeWeight(1);
    noFill();
    const x1 = x0;
    const x2 = x1 + colSpacing ;
    const leftBracketX = x1 - bracketLeftOffset;
    const rightBracketX = x2 + bracketRightOffset;
    drawOuterBrackets(leftBracketX, rightBracketX, y0);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    if (c1) {
        text(c1.x.toFixed(0), x1, y0 - 7);
        text((-c1.y).toFixed(0), x1, y0 + 10);
    } 
    if (c2) {
        text(c2.x.toFixed(0), x2, y0 - 7);
        text((-c2.y).toFixed(0), x2, y0 + 10);
    }

    if (step == 4) {
    const gap =  (bracketLeftOffset + bracketRightOffset) * (1/3);
    
    const xMul = rightBracketX + gap - 10;
    const scaleLeftEdge = xMul + gap;
    const xScale = scaleLeftEdge + bracketLeftOffset - 10;

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER); 
        textSize(18);
        text('×', xMul, y0);

    drawBrackets(xScale, y0, bracketLeftOffset, bracketRightOffset);
        if (currentScaling) {
            fill(200, 255, 200);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(12);
            text(currentScaling.x.toFixed(2), xScale, y0 - 7);
            text(currentScaling.y.toFixed(2), xScale, y0 + 10);
            textSize(18);
        }
    }

    pop();
}