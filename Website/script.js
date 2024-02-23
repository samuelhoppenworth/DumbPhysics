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
canvas.height = height * 0.75;
var detailFont = dpi == 2 ? "40px arial" : "20px arial";
function draw() {
    var width = window.innerWidth * dpi;
    var height = window.innerHeight * dpi;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, 100, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
