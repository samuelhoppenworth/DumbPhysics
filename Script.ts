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
canvas.height = height
console.log("hi: ")
let engine = new SimulatorEngine()
engine.addItem(new Ball())
engine.addItem(new Ball(Vector(20, 15), Vector(-2, 1), 5.0, 2))
engine.addItem(new Ball(Vector(30, 15), Vector(1, 3), 5.0, 2))
engine.addItem(new Ball(Vector(25, 12), Vector(-3, 0), 20.0, 4))
// engine.addItem(new Ball(Vector(10, 10), Vector(1, 5), 5.0, 2))
// engine.addItem(new Ball(Vector(5, 5), Vector(1, 5), 5.0, 2))
// engine.gravity = false

let renderer = new Renderer(engine, 50, Vector(-5, 25), ctx)
function draw() {
  
  renderer.render()
  engine.step()
  requestAnimationFrame(draw)
  // setTimeout(() => requestAnimationFrame(draw), 100)
}
draw()