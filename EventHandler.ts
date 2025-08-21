import { Renderer } from "./Renderer.js";
import { SimulatorEngine } from "./SimulatorEngine.js";
import { Item } from "./Items.js";
import { Vector, createVector, sub, add, scale } from "./Vector.js";

export class EventHandler {
  private renderer: Renderer
  private engine: SimulatorEngine
  private mouseMoveStart: Vector | null = null;
  private rendererStartOffset: Vector | null = null;
  private selectedItem: Item | null = null;
  private canvas: HTMLCanvasElement

  constructor(document: Document, renderer: Renderer, engine: SimulatorEngine, canvas: HTMLCanvasElement) {
    this.renderer = renderer
    this.engine = engine
    this.canvas = canvas;
    
    document.addEventListener("mouseup", this.mouseUp)
    document.addEventListener("pointermove", this.mouseMove)
    canvas.onwheel = this.scroll
    canvas.onmousedown = this.mouseDown
  }

  mouseDown = (event: MouseEvent) => {
    let mousePosition = createVector(event.x, event.y)
    this.mouseMoveStart = mousePosition
    this.rendererStartOffset = createVector(this.renderer.originOffset.x, this.renderer.originOffset.y)
  }

  mouseUp = (event: MouseEvent) => {
    this.mouseMoveStart = null
    this.rendererStartOffset = null
  }

  mouseMove = (event: MouseEvent) => {
    let mousePosition = createVector(event.clientX, event.clientY)
    let canvasPosition = this.getCanvasPosition(mousePosition)
    let canvasPositionMeters = this.renderer.translateFromCanvasCoordinates(canvasPosition)
    for (let item of this.engine.getItems()) {
      item.selected = item.containsPoint(canvasPositionMeters)
    }
    if (this.mouseMoveStart == null || this.rendererStartOffset == null) return
    let pixelOffset = sub(mousePosition, this.mouseMoveStart)
    pixelOffset.x *= -1;
    let meterOffset = scale(pixelOffset, 1/this.renderer.scale)
    this.renderer.originOffset = add(this.rendererStartOffset, meterOffset)
  }

  scroll = (event: WheelEvent) => {
    let mousePosition = createVector(event.x, event.y)
    let s = event.deltaY < 0 ? 0.98 : 1/0.98
    let canvasPosition = this.getCanvasPosition(mousePosition)
    canvasPosition.y *= -1
    let canvasPositionMeters = scale(canvasPosition, 1 / this.renderer.scale)
    this.renderer.scale /= s
    this.renderer.originOffset = add(this.renderer.originOffset, scale(canvasPositionMeters, 1 - s))
  }

  getCanvasPosition(clientCoords: Vector): Vector {
    let rect = this.canvas.getBoundingClientRect();
    return createVector(
        (clientCoords.x - rect.left) / (rect.right - rect.left) * this.canvas.width,
        (clientCoords.y - rect.top) / (rect.bottom - rect.top) * this.canvas.height
    );
  }
}