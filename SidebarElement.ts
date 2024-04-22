class SidebarElement {
  private engine: SimulatorEngine
  private index: number
  private sectionDiv: HTMLDivElement
  private massContainer: HTMLDivElement
  private massLabel: HTMLSpanElement
  private massInput: HTMLInputElement
  private radiusContainer: HTMLDivElement
  private radiusLabel: HTMLSpanElement
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

  constructor(item: Item & Collidable, parent: HTMLDivElement, index: number, engine: SimulatorEngine) {
    this.index = index;
    this.engine = engine;
    this.sectionDiv = document.createElement("div");

    // Mass
    this.massContainer = document.createElement("div");
    this.massInput = document.createElement("input");
    this.massInput.id = "massInput" + index.toString();
    this.massInput.type = "number";
    this.massInput.placeholder = item.mass.toFixed(2);
    this.massInput.oninput = () => this.engine.editProperty("mass", this.index, Number(this.massInput.value))
    this.massLabel = document.createElement("span");
    this.massLabel.innerText = "Mass: ";
    this.massContainer.appendChild(this.massLabel);
    this.massContainer.appendChild(this.massInput);

    // Radius
    this.radiusContainer = document.createElement("div");
    this.radiusInput = document.createElement("input");
    this.radiusInput.id = "radiusInput" + index.toString();
    this.radiusInput.type = "number";
    this.radiusInput.placeholder = item.minRadius.toFixed(2);
    this.radiusLabel = document.createElement("span");
    this.radiusLabel.innerText = "Radius: ";
    this.radiusContainer.appendChild(this.radiusLabel);
    this.radiusContainer.appendChild(this.radiusInput);

    // Position
    this.positionContainer = document.createElement("div");
    this.positionInputX = document.createElement("input");
    this.positionInputY = document.createElement("input");
    this.positionInputX.type = "number";
    this.positionInputY.type = "number";
    this.positionInputX.id = "positionInputX" + index.toString();;
    this.positionInputY.id = "positionInputY" + index.toString();;
    this.positionInputX.placeholder = item.position.x.toFixed(2);
    this.positionInputY.placeholder = item.position.y.toFixed(2);
    this.positionInputX.oninput = () => this.engine.editProperty("positionX", this.index, Number(this.positionInputX.value))
    this.positionInputY.oninput = () => this.engine.editProperty("positionY", this.index, Number(this.positionInputY.value))
    this.positionLabel = document.createElement("span");
    this.positionLabel.innerText = "Position (X, Y): ";
    this.positionContainer.appendChild(this.positionLabel);
    this.positionContainer.appendChild(this.positionInputX);
    this.positionContainer.appendChild(this.positionInputY);

    // Velocity
    this.velocityContainer = document.createElement("div");
    this.velocityInputX = document.createElement("input");
    this.velocityInputY = document.createElement("input");
    this.velocityInputX.type = "number";
    this.velocityInputY.type = "number";
    this.velocityInputX.id = "velocityInputX" + index.toString();
    this.velocityInputY.id = "velocityInputY" + index.toString();
    this.velocityInputX.placeholder = item.velocity.x.toFixed(2);
    this.velocityInputY.placeholder = item.velocity.y.toFixed(2);
    this.velocityLabel = document.createElement("span");
    this.velocityLabel.innerText = "Velocity (X, Y): ";
    this.velocityContainer.appendChild(this.velocityLabel);
    this.velocityContainer.appendChild(this.velocityInputX);
    this.velocityContainer.appendChild(this.velocityInputY);

    // Thumbnail
    this.thumbnail = document.createElement("canvas")
    this.thumbnail.width = 60
    this.thumbnail.height = 60
    this.thumbnail.style.border = "1px solid black"
    this.drawThumbnail(item)

    // Append elements to sectionDiv
    this.sectionDiv.appendChild(this.thumbnail)
    this.sectionDiv.appendChild(this.massContainer);
    this.sectionDiv.appendChild(this.radiusContainer);
    this.sectionDiv.appendChild(this.positionContainer);
    this.sectionDiv.appendChild(this.velocityContainer);

    // Append sectionDiv to parent
    parent.appendChild(this.sectionDiv);
  }

  drawThumbnail(item: Item & Collidable) {
    let ctx = this.thumbnail.getContext("2d")!
    ctx.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height)
    let itemScale = 25 / item.minRadius
    item.draw(ctx, Vector(30, 30), itemScale)
  }

  update(item: Item & Collidable) {
    // this.positionLabel.innerText = `Position: (${item.position.x.toFixed(2)}, ${item.position.y.toFixed(2)})`
    // this.velocityLabel.innerText = `Velocity: (${item.velocity.x.toFixed(2)}, ${item.velocity.y.toFixed(2)})`
    // this.massLabel.innerText = `Mass: ${item.mass.toFixed(2)}`
    this.radiusInput.placeholder = item.minRadius.toFixed(2);
    this.massInput.placeholder = item.mass.toFixed(2);
    this.positionInputX.placeholder = item.position.x.toFixed(2);
    this.positionInputY.placeholder = item.position.y.toFixed(2);
    this.velocityInputX.placeholder = item.velocity.x.toFixed(2);
    this.velocityInputY.placeholder = item.velocity.y.toFixed(2);
    this.radiusInput.value = item.minRadius.toFixed(2);
    this.massInput.value = item.mass.toFixed(2);
    this.positionInputX.value = item.position.x.toFixed(2);
    this.positionInputY.value = item.position.y.toFixed(2);
    this.velocityInputX.value = item.velocity.x.toFixed(2);
    this.velocityInputY.value = item.velocity.y.toFixed(2);

    this.drawThumbnail(item)
  }
}