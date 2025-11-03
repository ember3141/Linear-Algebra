// global display scale for vectors (1 = current behavior)
let vectScale = 1;

function centerOrigin() {
    translate(width / 2, height / 2);
}

function drawAxes() {
    stroke(100);
    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);
}

function mouseVec() {
    return createVector(mouseX - width / 2, mouseY - height / 2);
}

function drawVect(tip, col) {
    // draw using vectScale so small coordinate vectors can be scaled for visibility
    const tipScaled = p5.Vector.mult(tip, vectScale);

    stroke(col);
    strokeWeight(2);
    line(0, 0, tipScaled.x, tipScaled.y);

    push();
    translate(tipScaled.x, tipScaled.y);
    rotate(tip.heading());
    fill(col);
    noStroke();
    triangle(0, 0, -10, 6, -10, -6);
    pop();

    const x = tipScaled.x + 40;
    const y = tipScaled.y;
    drawBrackets(x, y, 20, 35);
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(tip.x.toFixed(0), x + 7, y - 7);
    text((-tip.y).toFixed(0), x + 7, y + 10);
    textSize(14);
}

function drawOuterBrackets(leftX, rightX, y) {
    stroke(255);
    strokeWeight(2);
    noFill();

    const top = y - 15;
    const bottom = y + 15;

    // Left
    line(leftX, top, leftX, bottom);
    line(leftX, top, leftX + 5, top);
    line(leftX, bottom, leftX + 5, bottom);

    // Right
    line(rightX, top, rightX, bottom);
    line(rightX - 5, top, rightX, top);
    line(rightX - 5, bottom, rightX, bottom);
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

// draws the little matrix display used in the demo, reads v1,v2,step,currentScaling
function drawMatrixDisplay() {
    push();
    resetMatrix();
    const colSpacing = 40;
    const x0 = 46;
    const bracketLeftOffset = 30;
    const bracketRightOffset = 35;
    const y0 = 46;
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
        const tailS = p5.Vector.mult(tail, vectScale);
        const tipS = p5.Vector.mult(tip, vectScale);
        stroke(col);
        strokeWeight(3);
        line(tailS.x, tailS.y, tipS.x, tipS.y);
        push();
        translate(tipS.x, tipS.y);
        rotate(this.vec.heading());
        fill(col);
        noStroke();
        triangle(0, 0, -10, 6, -10, -6);
        pop();
    }
    drawWithMatrix(col) {
        this.draw(col);
        const tip = this.tip();
        const tipS = p5.Vector.mult(tip, vectScale);
        const x = tipS.x + 40;
        const y = tipS.y;
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
        const tipS = p5.Vector.mult(tip, vectScale);
        const mid = p5.Vector.add(this.offset, tip).div(2);
        const midS = p5.Vector.mult(mid, vectScale);
        const x = tipS.x + 40;
        const y = tipS.y;
        drawBrackets(x, y, 20, 35);
        fill(255);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
        text(this.vec.x.toFixed(0), x + 7, y - 7);
        text((-this.vec.y).toFixed(0), x + 7, y + 10);
        text(this.scale.toFixed(2) + "×", midS.x, midS.y - 20);
        textSize(14);
    }
}

// // ensure globals for environments that restrict top-level scope
// expose a minimal API
const __G = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined') ? window : this;
__G.centerOrigin = centerOrigin;
__G.drawAxes = drawAxes;
__G.mouseVec = mouseVec;
__G.drawVect = drawVect;
__G.drawBrackets = drawBrackets;
__G.drawOuterBrackets = drawOuterBrackets;
__G.drawMatrixDisplay = drawMatrixDisplay;
__G.Vector = Vector;
__G.setVectScale = function(xLeft, xRight, yTop, yBottom) {
    // compute a uniform scale so the given bounds fit the canvas
    const sx = Math.abs(width / (xRight - xLeft));
    const sy = Math.abs(height / (yTop - yBottom));
    vectScale = Math.min(sx, sy) || 1;
};
__G.resetVectScale = function() { vectScale = 1; };
__G._vectScale = function() { return vectScale; };

try { console.log('vectorlib loaded'); } catch (e) {}
