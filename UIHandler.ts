import { eventBus } from "./EventBus.js";
import { SimulatorEngine } from "./SimulatorEngine.js";
import { Renderer } from "./Renderer.js";
import { EventHandler } from "./EventHandler.js";
import { SidebarElement } from "./SidebarElement.js";
import { Ball } from "./Items.js";
import { createVector } from "./Vector.js";

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

    this.itemsDiv = document.createElement("div");
    this.sidebarDiv.appendChild(this.itemsDiv);
    this.itemsDiv.style.overflow = "scroll";
    this.itemsDiv.style.height = String(document.body.clientHeight * 0.85) + "px";
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
    const newItem = new Ball(createVector(6, 6), createVector(2, 3), 5.0, 5, "#000000");
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