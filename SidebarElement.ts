class SidebarElement {
  private engine: SimulatorEngine
  index: number

  private parent: HTMLDivElement

  private handler: UIHandler

  private sectionDiv: HTMLDivElement
  private deleteButton: HTMLButtonElement
  private massContainer: HTMLDivElement
  private massLabel: HTMLSpanElement
  private massInput: HTMLInputElement
  // private radiusContainer: HTMLDivElement
  // private radiusLabel: HTMLSpanElement
  private radiusInput: HTMLInputElement
  private positionContainer: HTMLDivElement
  private positionLabel: HTMLSpanElement
  private positionInputX: HTMLInputElement
  private positionInputY: HTMLInputElement
  private velocityContainer: HTMLDivElement
  private velocityLabel: HTMLSpanElement
  private velocityInputX: HTMLInputElement
  private velocityInputY: HTMLInputElement
  private thumbnail: HTMLCanvasElement

  constructor(parent: HTMLDivElement, index: number, engine: SimulatorEngine, handler: UIHandler) {
    this.handler = handler
    this.index = index
    this.engine = engine
    this.sectionDiv = document.createElement("div")
    this.parent = parent

    let item = this.engine.getItem(this.index)

    // Thumbnail
    this.thumbnail = document.createElement("canvas")
    this.thumbnail.width = 60
    this.thumbnail.height = 60
    this.thumbnail.style.border = "1px solid black"
    this.drawThumbnail(item)

    // Delete button
    this.deleteButton = document.createElement("button")
    this.deleteButton.innerText = "Delete"
    this.deleteButton.onclick = () => {
      this.engine.removeItem(this.index)
      this.sectionDiv.remove()
      console.log("Killing ", this)
      this.handler.removeElement(this)
    }

    this.sectionDiv.appendChild(this.thumbnail)
    this.sectionDiv.appendChild(this.deleteButton)


    // Mass
    this.massInput = this.makeScalarInput("Mass: ", "mass")

    if (item instanceof Ball) {
      this.radiusInput = this.makeScalarInput("Radius: ", "radius")
    }

    let positionInputs = this.makeVectorInput("Position (X, Y): ", "position")
    this.positionInputX = positionInputs[0]
    this.positionInputY = positionInputs[1]

    let velocityInputs = this.makeVectorInput("Velocity (X, Y): ", "velocity")
    this.velocityInputX = velocityInputs[0]
    this.velocityInputY = velocityInputs[1]


    // Append sectionDiv to parent
    parent.appendChild(this.sectionDiv)
  }

  /** Creates a scalar input that modified the specified field
   * @param labelText the text to display next to the input
   * @param property the property to modify
   * @returns the input element
   */
  makeScalarInput(labelText: string, property: string) {
    let item = this.engine.getItem(this.index)
    let container = document.createElement("div")
    let input = document.createElement("input")
    input.type = "number"
    input.placeholder = item.minRadius.toFixed(2)
    input.oninput = () => this.engine.editProperty(property, this.index, Number(input.value))

    let label = document.createElement("p")
    label.innerText = labelText
    label.style.display = "inline-block"
    label.style.marginLeft = "0px"
    label.style.padding = "0px"
    container.appendChild(label)
    container.appendChild(input)
    this.sectionDiv.appendChild(container)
    return input
  }

  /** Creates a scalar input that modified the specified field
   * @param labelText the text to display next to the input (wihout the X or Y suffix)
   * @param property the property to modify
   * @returns a pair of input elements; the x and y inputs
   */
  makeVectorInput(labelText: string, property: string) {
    let item = this.engine.getItem(this.index)
    let container = document.createElement("div")
    let inputX = document.createElement("input")
    let inputY = document.createElement("input")
    inputX.type = "number"
    inputY.type = "number"
    inputX.placeholder = item.position.x.toFixed(2)
    inputY.placeholder = item.position.y.toFixed(2)
    inputX.oninput = () => this.engine.editProperty(property + "X", this.index, Number(inputX.value))
    inputY.oninput = () => this.engine.editProperty(property + "Y", this.index, Number(inputY.value))

    let label = document.createElement("p")
    label.innerText = labelText
    label.style.display = "inline-block"
    label.style.marginLeft = "0px"
    label.style.padding = "0px"
    container.appendChild(label)
    container.appendChild(inputX)
    container.appendChild(inputY)
    this.sectionDiv.appendChild(container)
    return [inputX, inputY]
  }

  drawThumbnail(item: Item & Collidable) {
    let ctx = this.thumbnail.getContext("2d")!
    ctx.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height)
    let itemScale = 25 / item.minRadius
    item.draw(ctx, Vector(30, 30), itemScale)
  }

  update() {
    let item = this.engine.getItem(this.index)
    this.radiusInput.placeholder = item.minRadius.toFixed(2)
    this.massInput.placeholder = item.mass.toFixed(2)
    this.positionInputX.placeholder = item.position.x.toFixed(2)
    this.positionInputY.placeholder = item.position.y.toFixed(2)
    this.velocityInputX.placeholder = item.velocity.x.toFixed(2)
    this.velocityInputY.placeholder = item.velocity.y.toFixed(2)
    this.positionInputX.value = item.position.x.toFixed(2)
    this.positionInputY.value = item.position.y.toFixed(2)
    this.velocityInputX.value = item.velocity.x.toFixed(2)
    this.velocityInputY.value = item.velocity.y.toFixed(2)

    this.drawThumbnail(item)
  }
}