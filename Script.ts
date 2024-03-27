let canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement
let ctx = canvas.getContext("2d")!
console.log("context:", ctx)
ctx.scale(1, 1)
//get the canvas, canvas context, and dpi
let dpi = window.devicePixelRatio

canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.8;
let engine = new SimulatorEngine()

engine.addItem(new Ball(Vector(100, 150), Vector(-1.5, 1), 2e13, 10, "blue"))
engine.addItem(new Ball(Vector(150, 100), Vector(20, 0), 1e13, 5, "red"))
engine.addItem(new Ball(Vector(50, 100), Vector(-1, -2), 1e13, 5))

engine.gravity = false
engine.attraction = true

let renderer = new Renderer(engine, 2, Vector(-5, 210), canvas, ctx)
let eventHandler = new EventHandler(document, renderer, engine, canvas)

let uiHandler = new UIHandler(canvas, engine, renderer, eventHandler)

uiHandler.draw()