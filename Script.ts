let canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement
let ctx = canvas.getContext("2d")!
console.log("context:", ctx)
ctx.scale(1, 1)
//get the canvas, canvas context, and dpi
let dpi = window.devicePixelRatio

let renderingDiv = document.getElementById("canvasDiv")! as HTMLDivElement
canvas.width = renderingDiv.clientWidth
canvas.height = renderingDiv.clientHeight


let engine = new SimulatorEngine()

// engine.addItem(new Ball(Vector(100, 150), Vector(-1.5, 1), 2e13, 10, "blue"))
engine.addItem(new Ball(Vector(150, 100), Vector(20, 0), 1e13, 5, "red"))
engine.addItem(new Ball(Vector(200, 100), Vector(-20, 0), 1e13, 5, "blue"))
// engine.addItem(new Ball(Vector(100, 50), Vector(-20, 0), 1e13, 5, "red"))
// engine.addItem(new Ball(Vector(100, 100), Vector(20, 0), 1e13, 5, "red"))

// engine.addItem(new Ball(Vector(50, 100), Vector(-1, -2), 1e13, 5))
// let vertices = [Vector(-5, -5), Vector(-5, 5), Vector(5, 5), Vector(5, -5)]
// engine.addItem(new RigidBody(Vector(50, 50), Vector(5, 0), 1e13, 0.2, 0.4, vertices, "blue"))
// console.log((engine.getItems()[0] as RigidBody).angularVelocity)
engine.gravity = false
engine.attraction = true

let renderer = new Renderer(engine, 2, Vector(-5, 210), canvas, ctx)
let eventHandler = new EventHandler(document, renderer, engine, canvas)

let uiHandler = new UIHandler(canvas, engine, renderer, eventHandler)

uiHandler.draw()