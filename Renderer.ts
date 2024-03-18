class Renderer {
  engine: SimulatorEngine
  // pixels/meter
  scale: number
  // Offset (in meters) of the Canvas's origin (at the top left) from the simulation origin
  originOffset: Vector
  ctx: CanvasRenderingContext2D

  // time when simulation started in milliseconds
  startTime: number

  display: boolean = true

  constructor(eng: SimulatorEngine, sc: number, originO: Vector, context: CanvasRenderingContext2D) {
    this.engine = eng
    this.scale = sc
    this.originOffset = originO
    this.ctx = context
  }

  render() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    for (let item of this.engine.getItems()) {
      item.draw(ctx, this.translateToCanvasCoordinates(item.position), this.scale)
    }
    this.drawBoundary()
  }

  private translateToCanvasCoordinates(p: Vector): Vector {
    let framePositionMeters = sub(p, this.originOffset)
    framePositionMeters.y *= -1
    return scale(framePositionMeters, this.scale)
  }

  private drawBoundary() {
    let origin = this.translateToCanvasCoordinates(Vector(0, this.engine.boxHeight))
    let width = this.engine.boxWidth * this.scale
    let height = this.engine.boxHeight * this.scale
    this.ctx.strokeRect(origin.x, origin.y, width, height)
  }
}