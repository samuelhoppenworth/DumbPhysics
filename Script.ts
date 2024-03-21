let canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement
let ctx = canvas.getContext("2d")!
console.log("context:", ctx)
ctx.scale(1, 1)
//get the canvas, canvas context, and dpi
let dpi = window.devicePixelRatio

// let container = document.getElementById("canvas-container")!;
// let canvasBounds = container.getBoundingClientRect()
// canvas.width = canvas.parentElement!.clientWidth * canvas.width / (canvasBounds.width) * dpi;
// canvas.height = canvas.parentElement!.clientHeight;
canvas.width = window.innerWidth * 0.6;
canvas.height = window.innerHeight * 0.9;
// canvas.height = container.offsetHeight;
// console.log(container.offsetWidth, container.offsetHeight)
let engine = new SimulatorEngine()
// engine.addItem(new Ball(Vector(20, 15), Vector(0, 0), 5.0, 2, "red"))
// engine.addItem(new Ball(Vector(30, 15), Vector(0, 0), 5.0, 2, "green"))

engine.addItem(new Ball(Vector(100, 150), Vector(-1.5, 1), 2e13, 10, "blue"))
engine.addItem(new Ball(Vector(150, 100), Vector(20, 0), 1e13, 5, "red"))
engine.addItem(new Ball(Vector(50, 100), Vector(-1, -2), 1e13, 5))


// engine.addItem(new Ball(Vector(200, 100), Vector(0, 0), 2e13, 1, "green"))
// engine.addItem(new Ball(Vector(150, 100), Vector(0, 0), 1e13, 5, "red"))
// engine.addItem(new Ball(Vector(50, 100), Vector(0, 0), 1e13, 5))

// engine.addItem(new Ball(Vector(5, 5), Vector(0, 0), 5.0, 2))
engine.gravity = false
engine.attraction = true

let renderer = new Renderer(engine, 2, Vector(-5, 210), ctx)
let eventHandler = new EventHandler(document, renderer, engine, canvas)

function draw() {
  
  renderer.render()
  engine.step()
  requestAnimationFrame(draw)
}
draw()