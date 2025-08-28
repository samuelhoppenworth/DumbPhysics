import { SimulatorEngine } from "../simulator/SimulatorEngine.js";
import { Vector, createVector, sub, scale, add } from "../simulator/Vector.js";

export class Renderer {
  engine: SimulatorEngine
  scale: number
  originOffset: Vector
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  startTime: number

  constructor(eng: SimulatorEngine, sc: number, originO: Vector, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.engine = eng
    this.scale = sc
    this.originOffset = originO
    this.canvas = canvas
    this.ctx = context
    this.startTime = performance.now()
  }

  render() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    for (let item of this.engine.getItems()) {
      item.draw(this.ctx, this.translateToCanvasCoordinates(item.position), this.scale)
    }
    this.drawBoundary()
    this.drawCanvasBoundary()
  }

  translateToCanvasCoordinates(p: Vector): Vector {
    let framePositionMeters = sub(p, this.originOffset)
    framePositionMeters.y *= -1
    return scale(framePositionMeters, this.scale)
  }

  translateFromCanvasCoordinates(p: Vector): Vector {
    let framePositionPixels = scale(p, 1/this.scale)
    framePositionPixels.y *= -1
    return add(framePositionPixels, this.originOffset)
  }

  private drawCanvasBoundary() {
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawBoundary() {
    this.ctx.strokeStyle = "white"
    let origin = this.translateToCanvasCoordinates(createVector(0, this.engine.boxHeight))
    let width = this.engine.boxWidth * this.scale
    let height = this.engine.boxHeight * this.scale
    this.ctx.lineWidth = this.scale
    this.ctx.strokeRect(origin.x, origin.y, width, height)
  }
}