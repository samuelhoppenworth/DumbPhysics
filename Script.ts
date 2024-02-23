let canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement
let ctx = canvas.getContext("2d")!
console.log("context:", ctx)
//get the canvas, canvas context, and dpi
let dpi = window.devicePixelRatio

document.addEventListener("mousedown", mouseDownHandler)
document.addEventListener("mouseup", mouseUpHandler)
document.addEventListener("pointermove", mouseMoveHandler)

function mouseDownHandler(event: MouseEvent) {
  let x = event.pageX * dpi
  let y = event.pageY * dpi
}

function mouseUpHandler(event: MouseEvent) {
}

function mouseMoveHandler(event: MouseEvent) {
  let x = event.pageX * dpi
  let y = event.pageY * dpi
}

let width = window.innerWidth * dpi
let height = window.innerHeight * dpi
canvas.width = width
canvas.height = height * 0.75
let detailFont = dpi == 2 ? "40px arial" : "20px arial"


function draw() {
  let width = window.innerWidth * dpi
  let height = window.innerHeight * dpi
  ctx.lineWidth = this.lineWidth
  ctx.beginPath()
  ctx.ellipse(100, 100, 100, 100, 0, 0, 2*Math.PI)
  ctx.fill()
  ctx.closePath()
  requestAnimationFrame(draw)
  
}
requestAnimationFrame(draw)