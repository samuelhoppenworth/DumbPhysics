import { SimulatorEngine } from "./simulator/SimulatorEngine.js";
import { Ball } from "./simulator/Items.js";
import { Renderer } from "./ui/Renderer.js";
import { EventHandler } from "./ui/EventHandler.js";
import { UIHandler } from "./ui/UIHandler.js";
// Use an alias to keep the `Vector()` syntax in this file
import { createVector as Vector } from "./simulator/Vector.js";

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
engine.addItem(new Ball(Vector(150, 100), Vector(20, 0), 5, 5, "#FF0000"))
engine.addItem(new Ball(Vector(200, 100), Vector(-20, 0), 5, 5, "#0000FF"))
// engine.addItem(new Ball(Vector(100, 50), Vector(-20, 0), 1e13, 5, "red"))
// engine.addItem(new Ball(Vector(100, 100), Vector(20, 0), 1e13, 5, "red"))

// engine.addItem(new Ball(Vector(50, 100), Vector(-1, -2), 1e13, 5))
// let vertices = [Vector(-5, -5), Vector(-5, 5), Vector(5, 5), Vector(5, -5)]
// engine.addItem(new RigidBody(Vector(50, 50), Vector(10, 0), 10, 0.2, 0.4, vertices, "#0000FF"))

// vertices = [Vector(-5, -5), Vector(-5, 5), Vector(5, -5), Vector(0, 0)]
// engine.addItem(new RigidBody(Vector(100, 50), Vector(5, 5), 10, -0.2, -0.4, vertices, "#00FF00"))

// vertices = [Vector(-5, -5), Vector(-5, 5), Vector(5, 5), Vector(5, -5), Vector(25, 12), Vector(25, -12)]
// engine.addItem(new RigidBody(Vector(50, 100), Vector(-5, -1), 10, 1, 5.4, vertices, "#FF0000"))

// make shape with n vertices
// vertices = []
// let n = 10
// for (let i = 0; i < n; i++) {
//   vertices.push(Vector(10*Math.cos(i/n*2*Math.PI), 10*Math.sin(i/n*2*Math.PI)))
// }
// engine.addItem(new RigidBody(Vector(150, 150), Vector(1, -4), 10, 0.2, -0.1, vertices, "#000000"))
// console.log((engine.getItems()[0] as RigidBody).angularVelocity)
engine.gravity = false
engine.attraction = true

let renderer = new Renderer(engine, 2, Vector(-5, 210), canvas, ctx)
let eventHandler = new EventHandler(document, renderer, engine, canvas)

let uiHandler = new UIHandler(canvas, engine, renderer, eventHandler)

uiHandler.draw()