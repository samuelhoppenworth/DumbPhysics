class EventHandler {
  private renderer: Renderer
  private engine: SimulatorEngine
  /** `null` if the mouse isn't currently moving, the start position of the mouse in pixels otherwise */
  private mouseMoveStart: Vector | null

  /** `null` if the mouse isn't currently moving, otherwise the renderer's initial `originOffset` */
  private rendererStartOffset: Vector | null

  private selectedItem: Item | null

  /** A reference to the canvas element being drawn on. 
   * By keeping this reference (instead of just storing its position and size, we don't have to write any other) */
  private canvas: HTMLCanvasElement

  constructor(document: Document, renderer: Renderer, engine: SimulatorEngine, canvas: HTMLCanvasElement) {
    this.renderer = renderer
    this.engine = engine
    // document.addEventListener("mousedown", this.mouseDown)
    document.addEventListener("mouseup", this.mouseUp)
    document.addEventListener("pointermove", this.mouseMove)
    canvas.onwheel = this.scroll
    canvas.onmousedown = this.mouseDown
    this.canvas = canvas
  }

  // these can't be regular methods - see https://www.typescriptlang.org/docs/handbook/2/classes.html#this-at-runtime-in-classes
  // luckily, we'll likely only ever have one instance of EventHandler, so this doesn't use any extra memory :)
  mouseDown = (event: MouseEvent) => {
    let mousePosition = Vector(event.x, event.y)
    this.mouseMoveStart = mousePosition
    // need to make a deep copy
    this.rendererStartOffset = Vector(this.renderer.originOffset.x, this.renderer.originOffset.y)
  }

  mouseUp = (event: MouseEvent) => {
    this.mouseMoveStart = null
    this.rendererStartOffset = null
  }

  mouseMove = (event: MouseEvent) => {
    let mousePosition = Vector(event.clientX, event.clientY)
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
    let mousePosition = Vector(event.x, event.y)
    let s = event.deltaY < 0 ? 0.98 : 1/0.98
    let canvasPosition = this.getCanvasPosition(mousePosition)
    canvasPosition.y *= -1
    let canvasPositionMeters = scale(canvasPosition, 1 / this.renderer.scale)
    this.renderer.scale /= s
    this.renderer.originOffset = add(this.renderer.originOffset, scale(canvasPositionMeters, 1 - s))
  }

  /** Converst a coordinate in client space to a coordinate in canvas space
   * 
   * **IMPORTANT** This only works when the canvas element has no padding. If you want to add padding, you need to add it to canvas-container, not to the canvas itself
   */
  getCanvasPosition(clientCoords: Vector): Vector {
    let rect = this.canvas.getBoundingClientRect();
    return Vector(
        (clientCoords.x - rect.left) / (rect.right - rect.left) * canvas.width,
        (clientCoords.y - rect.top) / (rect.bottom - rect.top) * canvas.height
    );
}
}