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


// outer bracket drawing moved to vectorlib.js

function draw() {
    background(10);
    image(persist, 0, 0);
    drawMatrixDisplay();

    centerOrigin();
    drawAxes();
    
    switch (step) {
        case 0:
            resetMatrix();
            fill(255);
            noStroke();
            text("Click to set the red vector", width / 2, 25);
            translate(width / 2, height / 2);
            
            const m0 = mouseVec();
            // Draw preview using helper
            drawVect(m0, color(255, 100, 100));
            break;
            
        case 1:
            v1.drawWithMatrix(color(255, 100, 100));
            resetMatrix();
            fill(255);
            noStroke();
            text("Click to set the blue vector", width / 2, 25);
            translate(width / 2, height / 2);
            
            const m1 = mouseVec();
            drawVect(m1, color(100, 150, 255));
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
                // Vectors are parallel Constrain  mouse to line spanned by v1.original
                const v = v1.original.copy();
                const denom = v.x * v.x + v.y * v.y;
                if (denom > 1e-6) {
                    // get scalar that projects m onto v: s_proj * v = projection
                    const s_proj = (m.x * v.x + m.y * v.y) / denom;

                    v1.setScale(s_proj);
                    v2.setScale(0);
                    v2.offset = v1.vec.copy();

                    // projected point in new cords
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
                // convert centered coords to pixel coords for persist (respect vectScale)
                const px = (mDisplay.x * (typeof vectScale !== 'undefined' ? vectScale : 1)) + width / 2;
                const py = (mDisplay.y * (typeof vectScale !== 'undefined' ? vectScale : 1)) + height / 2;

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