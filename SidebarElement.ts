import { SimulatorEngine } from "./SimulatorEngine.js";
import { UIHandler } from "./UIHandler.js";
import { Item, Collidable, Ball, RigidBody } from "./Items.js";
import { Vector, createVector } from "./Vector.js";

export class SidebarElement {
  private engine: SimulatorEngine
  index: number
  private parent: HTMLDivElement
  private handler: UIHandler
  private sectionDiv: HTMLDivElement
  private deleteButton: HTMLButtonElement
  private massInput: HTMLInputElement
  private radiusInput!: HTMLInputElement; 
  private positionInputX: HTMLInputElement
  private positionInputY: HTMLInputElement
  private velocityInputX: HTMLInputElement
  private velocityInputY: HTMLInputElement
  private thumbnail: HTMLCanvasElement
  private colorInput!: HTMLInputElement;
  private thumbnailWidth: number = 60

  constructor(parent: HTMLDivElement, index: number, engine: SimulatorEngine, handler: UIHandler) {
    this.handler = handler
    this.index = index
    this.engine = engine
    this.sectionDiv = document.createElement("div")
    this.parent = parent
    let item = this.engine.getItem(this.index)
    let header = document.createElement("div")

    this.thumbnail = document.createElement("canvas")
    this.thumbnail.width = this.thumbnailWidth
    this.thumbnail.height = this.thumbnailWidth
    this.thumbnail.style.border = "1px solid black"
    this.thumbnail.style.display = "inline-block"
    this.drawThumbnail(item)

    if (item instanceof Ball || item instanceof RigidBody) {
      this.colorInput = document.createElement("input")
      this.colorInput.type = "color"
      this.colorInput.value = item.color
      this.colorInput.oninput = () => {
        this.engine.editProperty("color", this.index, this.colorInput.value)
        this.drawThumbnail(item)
      }
    }

    this.deleteButton = document.createElement("button")
    this.deleteButton.innerText = "Delete"
    this.deleteButton.onclick = () => {
      this.engine.removeItem(this.index)
      this.sectionDiv.remove()
      this.handler.removeElement(this)
    }
    this.deleteButton.style.display = "inline-block"
    this.deleteButton.style.marginTop = "0px"

    header.appendChild(this.thumbnail)
    header.appendChild(this.deleteButton)
    if (this.colorInput) {
        header.appendChild(this.colorInput)
    }

    this.sectionDiv.appendChild(header)
    
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

    parent.appendChild(this.sectionDiv)
  }

  makeScalarInput(labelText: string, property: string): HTMLInputElement {
    let item = this.engine.getItem(this.index)
    let container = document.createElement("div")
    let input = document.createElement("input")
    input.type = "number"
    input.placeholder = item.minRadius.toFixed(2)
    input.oninput = () => this.engine.editProperty(property, this.index, input.value)
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

  makeVectorInput(labelText: string, property: string): [HTMLInputElement, HTMLInputElement] {
    let item = this.engine.getItem(this.index)
    let container = document.createElement("div")
    let inputX = document.createElement("input")
    let inputY = document.createElement("input")
    inputX.type = "number"
    inputY.type = "number"
    inputX.placeholder = item.position.x.toFixed(2)
    inputY.placeholder = item.position.y.toFixed(2)
    inputX.oninput = () => this.engine.editProperty(property + "X", this.index, inputX.value)
    inputY.oninput = () => this.engine.editProperty(property + "Y", this.index, inputY.value)
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
    item.draw(ctx, createVector(30, 30), itemScale)
  }

  update() {
    let item = this.engine.getItem(this.index)
    if (item instanceof Ball) {
      this.radiusInput.placeholder = item.minRadius.toFixed(2)
    }
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