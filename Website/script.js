var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
function Vector(x, y) {
    return { x: x, y: y };
}
function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}
function scale(p, s) {
    return Vector(p.x * s, p.y * s);
}
function magSq(p) {
    return dot(p, p);
}
// returns the vector a - b
function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
// returns the vector a + b
function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
var Ball = /** @class */ (function () {
    function Ball(position, velocity, mass, radius) {
        if (position === void 0) { position = Vector(6, 6); }
        if (velocity === void 0) { velocity = Vector(2, 3); }
        if (mass === void 0) { mass = 5.0; }
        if (radius === void 0) { radius = 2; }
        this.position = position;
        this.velocity = velocity;
        this.mass = mass;
        this.radius = radius;
    }
    Ball.prototype.draw = function (ctx, center, scale) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, this.radius * scale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    };
    Ball.prototype.intersectsSegment = function (p1, p2) {
        var rp1 = sub(p1, this.position);
        var rp2 = sub(p2, this.position);
        var radiusSq = this.radius * this.radius;
        // check if collision is at the vertices
        if (magSq(rp1) <= radiusSq || magSq(rp2) <= radiusSq) {
            return true;
        }
        var v12 = sub(p1, p2);
        // project the difference vectors onto the line segment
        var projection1 = scale(v12, dot(rp1, v12) / magSq(v12));
        var projection2 = scale(v12, dot(rp2, v12) / magSq(v12));
        // if the ball is not between the two points, we return false.
        // This happens when the projection vectors from the ball to the points are in the same direction (when their dot product is positive)
        if (dot(projection1, projection2) > 0) {
            return false;
        }
        // the vector straight from the ball to the segment; the shortest distance.
        var altitudeVec = sub(rp1, projection1);
        return magSq(altitudeVec) <= radiusSq;
    };
    return Ball;
}());
var SimulatorEngine = /** @class */ (function () {
    function SimulatorEngine() {
        this.items = [];
        this.collisionFlags = [];
        this.timestep = 0.0967;
        this.gravity = true;
        this.boxWidth = 50;
        this.boxHeight = 20;
    }
    SimulatorEngine.prototype.step = function () {
        // move them forward
        for (var i in this.items) {
            this.collisionFlags[i] = false;
            var item = this.items[i];
            item.position = add(item.position, scale(item.velocity, this.timestep));
            console.log("item.position: ", item.position);
        }
        this.processAllCollisions();
        // apply forces and collisions
        for (var i in this.items) {
            // applying forces like gravity after collision has weird consequences, like a loss of conservation of energy.
            if (this.collisionFlags[i]) {
                continue;
            }
            console.log("YAYYY");
            var item = this.items[i];
            var force = this.resolveForce(item);
            var acceleration = scale(force, 1 / item.mass);
            item.velocity = add(item.velocity, scale(acceleration, this.timestep));
        }
    };
    SimulatorEngine.prototype.addItem = function (item) {
        this.items.push(item);
        this.collisionFlags.push(false);
    };
    SimulatorEngine.prototype.getItems = function () {
        return this.items;
    };
    SimulatorEngine.prototype.checkWallCollisions = function (item) {
        var box00 = Vector(0, 0);
        var box01 = Vector(0, this.boxHeight);
        var box10 = Vector(this.boxWidth, 0);
        var box11 = Vector(this.boxWidth, this.boxHeight);
        var collision = false;
        if (item.intersectsSegment(box00, box10)) {
            if (item.velocity.y < 0)
                item.velocity.y *= -1;
            collision = true;
        }
        if (item.intersectsSegment(box01, box11)) {
            if (item.velocity.y > 0)
                item.velocity.y *= -1;
            collision = true;
        }
        if (item.intersectsSegment(box00, box01)) {
            if (item.velocity.x < 0)
                item.velocity.x *= -1;
            collision = true;
        }
        if (item.intersectsSegment(box10, box11)) {
            if (item.velocity.x > 0)
                item.velocity.x *= -1;
            collision = true;
        }
        return collision;
    };
    SimulatorEngine.prototype.processAllCollisions = function () {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (this.checkWallCollisions(item))
                this.collisionFlags[i] = true;
            for (var j = i + 1; j < this.items.length; j++) {
                var other = this.items[j];
                if (item instanceof Ball && other instanceof Ball) {
                    var diff = sub(item.position, other.position);
                    // they must also be moving towards each other
                    if (dot(diff, sub(item.velocity, other.velocity)) > 0) {
                        continue;
                    }
                    var distance = Math.sqrt(magSq(diff));
                    if (distance <= (item.radius + other.radius)) {
                        var normal = scale(diff, 1 / distance);
                        var v1 = dot(item.velocity, normal);
                        var v2 = dot(other.velocity, normal);
                        var m1 = item.mass;
                        var m2 = other.mass;
                        var u1 = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2);
                        var u2 = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2);
                        var v1f = add(item.velocity, scale(normal, u1 - v1));
                        var v2f = add(other.velocity, scale(normal, u2 - v2));
                        item.velocity = v1f;
                        other.velocity = v2f;
                        this.collisionFlags[i] = true;
                        this.collisionFlags[j] = true;
                    }
                }
            }
        }
    };
    SimulatorEngine.prototype.resolveForce = function (item) {
        if (this.gravity) {
            return Vector(0, -item.mass);
        }
        else {
            return Vector(0, 0);
        }
    };
    return SimulatorEngine;
}());
var Renderer = /** @class */ (function () {
    function Renderer(eng, sc, originO, context) {
        this.display = true;
        this.engine = eng;
        this.scale = sc;
        this.originOffset = originO;
        this.ctx = context;
    }
    Renderer.prototype.render = function () {
        var e_1, _a;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        try {
            for (var _b = __values(this.engine.getItems()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                item.draw(ctx, this.translateToCanvasCoordinates(item.position), this.scale);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.drawBoundary();
    };
    Renderer.prototype.translateToCanvasCoordinates = function (p) {
        var framePositionMeters = sub(p, this.originOffset);
        framePositionMeters.y *= -1;
        return scale(framePositionMeters, this.scale);
    };
    Renderer.prototype.drawBoundary = function () {
        var origin = this.translateToCanvasCoordinates(Vector(0, this.engine.boxHeight));
        var width = this.engine.boxWidth * this.scale;
        var height = this.engine.boxHeight * this.scale;
        this.ctx.strokeRect(origin.x, origin.y, width, height);
    };
    return Renderer;
}());
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
console.log("context:", ctx);
//get the canvas, canvas context, and dpi
var dpi = window.devicePixelRatio;
document.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("mouseup", mouseUpHandler);
document.addEventListener("pointermove", mouseMoveHandler);
function mouseDownHandler(event) {
    var x = event.pageX * dpi;
    var y = event.pageY * dpi;
}
function mouseUpHandler(event) {
}
function mouseMoveHandler(event) {
    var x = event.pageX * dpi;
    var y = event.pageY * dpi;
}
var width = window.innerWidth * dpi;
var height = window.innerHeight * dpi;
canvas.width = width;
canvas.height = height;
console.log("hi: ");
var engine = new SimulatorEngine();
engine.addItem(new Ball());
engine.addItem(new Ball(Vector(20, 15), Vector(-2, 1), 5.0, 2));
engine.addItem(new Ball(Vector(30, 15), Vector(1, 3), 5.0, 2));
engine.addItem(new Ball(Vector(25, 12), Vector(-3, 0), 20.0, 4));
// engine.addItem(new Ball(Vector(10, 10), Vector(1, 5), 5.0, 2))
// engine.addItem(new Ball(Vector(5, 5), Vector(1, 5), 5.0, 2))
// engine.gravity = false
var renderer = new Renderer(engine, 50, Vector(-5, 25), ctx);
function draw() {
    renderer.render();
    engine.step();
    requestAnimationFrame(draw);
    // setTimeout(() => requestAnimationFrame(draw), 100)
}
draw();
