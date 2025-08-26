import { eventBus } from "../core/EventBus.js";
import { SimulatorEngine } from "../simulator/SimulatorEngine.js";
import { Renderer } from "./Renderer.js";
import { EventHandler } from "./EventHandler.js";
import { SidebarElement } from "./SidebarElement.js";
import { Ball } from "../simulator/Items.js";
import { createVector } from "../simulator/Vector.js";

export class UIHandler {
  canvas: HTMLCanvasElement
  sidebarDiv: HTMLDivElement
  engine: SimulatorEngine
  renderer: Renderer
  eventHandler: EventHandler
  playing: boolean
  engineRepetitions: number
  queuedRepetitions: number
  speedSlider: HTMLInputElement
  speedInput: HTMLInputElement
  playPauseButton: HTMLButtonElement
  sidebarElements: Array<SidebarElement> = []
  itemsDiv!: HTMLDivElement

  // Inputs for creating a new item
  private newItemPosXInput!: HTMLInputElement;
  private newItemPosYInput!: HTMLInputElement;
  private newItemVelXInput!: HTMLInputElement;
  private newItemVelYInput!: HTMLInputElement;
  private newItemMassInput!: HTMLInputElement;
  private newItemRadiusInput!: HTMLInputElement;
  private newItemColorInput!: HTMLInputElement;

  constructor(canvas: HTMLCanvasElement, engine: SimulatorEngine, renderer: Renderer, eventHandler: EventHandler) {
    this.canvas = canvas
    this.engine = engine
    this.renderer = renderer
    this.eventHandler = eventHandler
    this.playing = false
    this.engineRepetitions = 1
    this.queuedRepetitions = 1

    // Setup UI listeners and create initial sidebar elements
    this.speedInput = document.getElementById("speedInput")! as HTMLInputElement;
    this.speedSlider = document.getElementById("speedSlider")! as HTMLInputElement;
    this.playPauseButton = document.getElementById("playpause")! as HTMLButtonElement;
    this.sidebarDiv = document.getElementById("sidebar")! as HTMLDivElement;

    this.setupUIListeners();
    this.createInitialSidebarElements();

    // Listen for events from the engine
    this.setupEngineEventListeners();
  }

  private setupUIListeners(): void {
    this.speedInput.addEventListener("focusout", this.textFieldChange);
    this.speedSlider.addEventListener("input", this.speedChange);
    this.playPauseButton.addEventListener("click", this.togglePlay);

    let titleDiv = document.createElement("div");
    let title = document.createElement("h2");
    title.innerText = "Editor";
    title.style.display = "inline-block";
    let addButton = document.createElement("button");
    addButton.innerText = "Add Item";
    addButton.style.display = "inline-block";
    addButton.onclick = this.addItem;
    titleDiv.appendChild(title);
    titleDiv.appendChild(addButton);
    this.sidebarDiv.appendChild(titleDiv);

    // Add the form for creating new items
    this.createItemForm();

    // Gravity and Attraction controls
    let globalSettingsDiv = document.createElement("div");
    globalSettingsDiv.id = "globalSettings";

    let gravityCheckbox = document.createElement("input");
    gravityCheckbox.type = "checkbox";
    gravityCheckbox.id = "gravity";
    gravityCheckbox.checked = this.engine.gravity;
    gravityCheckbox.onchange = () => eventBus.dispatch('gravityToggled', gravityCheckbox.checked);
    
    let gravityLabel = document.createElement("label");
    gravityLabel.htmlFor = "gravity";
    gravityLabel.innerText = "Gravity";
    
    let attractionCheckbox = document.createElement("input");
    attractionCheckbox.type = "checkbox";
    attractionCheckbox.id = "attraction";
    attractionCheckbox.checked = this.engine.attraction;
    attractionCheckbox.onchange = () => eventBus.dispatch('attractionToggled', attractionCheckbox.checked);
    
    let attractionLabel = document.createElement("label");
    attractionLabel.htmlFor = "attraction";
    attractionLabel.innerText = "Attraction";
    
    globalSettingsDiv.appendChild(gravityCheckbox);
    globalSettingsDiv.appendChild(gravityLabel);
    globalSettingsDiv.appendChild(attractionCheckbox);
    globalSettingsDiv.appendChild(attractionLabel);
    this.sidebarDiv.appendChild(globalSettingsDiv);


    this.itemsDiv = document.createElement("div");
    this.sidebarDiv.appendChild(this.itemsDiv);
    this.itemsDiv.style.overflow = "scroll";
    this.itemsDiv.style.height = String(document.body.clientHeight * 0.70) + "px"; // Adjusted height
  }

  private createItemForm(): void {
    const formDiv = document.createElement("div");
    formDiv.id = "newItemForm";

    const formTitle = document.createElement("h3");
    formTitle.innerText = "New Item Properties";
    formDiv.appendChild(formTitle);

    // Position
    const [posX, posY] = this.createVectorInputs(formDiv, "Position (X, Y):", { x: 50, y: 50 });
    this.newItemPosXInput = posX;
    this.newItemPosYInput = posY;

    // Velocity
    const [velX, velY] = this.createVectorInputs(formDiv, "Velocity (X, Y):", { x: 10, y: 0 });
    this.newItemVelXInput = velX;
    this.newItemVelYInput = velY;

    // Mass
    this.newItemMassInput = this.createScalarInput(formDiv, "Mass:", 10);

    // Radius
    this.newItemRadiusInput = this.createScalarInput(formDiv, "Radius:", 5);

    // Color
    this.newItemColorInput = this.createColorInput(formDiv, "Color:", "#000000");

    this.sidebarDiv.appendChild(formDiv);
  }

  private createScalarInput(parent: HTMLElement, labelText: string, defaultValue: number): HTMLInputElement {
      const container = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = labelText;
      const input = document.createElement("input");
      input.type = "number";
      input.value = String(defaultValue);
      container.appendChild(label);
      container.appendChild(input);
      parent.appendChild(container);
      return input;
  }

  private createVectorInputs(parent: HTMLElement, labelText: string, defaultValue: { x: number, y: number }): [HTMLInputElement, HTMLInputElement] {
      const container = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = labelText;
      const inputX = document.createElement("input");
      inputX.type = "number";
      inputX.value = String(defaultValue.x);
      const inputY = document.createElement("input");
      inputY.type = "number";
      inputY.value = String(defaultValue.y);
      container.appendChild(label);
      container.appendChild(inputX);
      container.appendChild(inputY);
      parent.appendChild(container);
      return [inputX, inputY];
  }
  
  private createColorInput(parent: HTMLElement, labelText: string, defaultValue: string): HTMLInputElement {
    const container = document.createElement("div");
    const label = document.createElement("label");
    label.innerText = labelText;
    const input = document.createElement("input");
    input.type = "color";
    input.value = defaultValue;
    container.appendChild(label);
    container.appendChild(input);
    parent.appendChild(container);
    return input;
  }

  private createInitialSidebarElements(): void {
    for (const item of this.engine.getItems()) {
        const index = this.engine.getItems().indexOf(item);
        this.sidebarElements.push(new SidebarElement(this.itemsDiv, index, this.engine, this));
    }
  }

  private setupEngineEventListeners(): void {
    eventBus.on('itemAdded', (data: { item: any; index: number }) => {
      this.sidebarElements.push(new SidebarElement(this.itemsDiv, data.index, this.engine, this));
    });
  }

  addItem = () => {
    // Read values from the new item form inputs
    const posX = parseFloat(this.newItemPosXInput.value) || 0;
    const posY = parseFloat(this.newItemPosYInput.value) || 0;
    const velX = parseFloat(this.newItemVelXInput.value) || 0;
    const velY = parseFloat(this.newItemVelYInput.value) || 0;
    const mass = parseFloat(this.newItemMassInput.value) || 10;
    const radius = parseFloat(this.newItemRadiusInput.value) || 5;
    const color = this.newItemColorInput.value || "#000000";

    // Create a new Ball with the specified attributes
    const newItem = new Ball(
        createVector(posX, posY),
        createVector(velX, velY),
        mass,
        radius,
        color
    );

    // Dispatch the event to the engine
    eventBus.dispatch('addItem', newItem);
  }

  updateSidebar() {
    for (let element of this.sidebarElements) {
      element.update()
    }
  }

  removeElement(e: SidebarElement) {
    let idx = this.sidebarElements.indexOf(e)
    this.sidebarElements.splice(idx, 1)
  }

  togglePlay = (evt: Event) => {
    this.playing = !this.playing
    this.playPauseButton.innerText = this.playing ? "⏸" : "⏵"
  }
  
  getSpeed(x: number) {
    let s = 3
    if (x >= 0) {
      return s*x + 1
    } else {
      return Math.exp(s*x)
    }
  }

  getSpeedInverse(x: number) {
    let s = 3
    if (x >= 1) {
      return (x - 1) / s
    } else {
      return Math.log(x) / s
    }
  }

  speedChange = (evt: Event) => {
    this.engineRepetitions = this.getSpeed(Number(this.speedSlider.value))
    this.speedInput.value = this.engineRepetitions.toFixed(2)
  }

  textFieldChange = (evt: FocusEvent) => {
    let value = Number.parseFloat(this.speedInput.value)
    if (Number.isNaN(value)) {
      this.speedInput.value = this.engineRepetitions.toFixed(2)
    } else {
      this.engineRepetitions = value
      this.speedInput.value = this.engineRepetitions.toFixed(2)
      this.speedSlider.value = this.getSpeedInverse(value).toString()
    }
  }

  draw = () => {
    this.renderer.render()
    if (this.playing) {
      let n = Math.floor(this.queuedRepetitions)
      this.queuedRepetitions -= n
      for (let i = 0; i < n; i++) {
        this.engine.step()
      }
      this.queuedRepetitions += this.engineRepetitions
      this.updateSidebar()
    }
    requestAnimationFrame(this.draw)
  }
}