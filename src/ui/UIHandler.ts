import { eventBus } from "../core/EventBus.js";
import { SimulatorEngine } from "../simulator/SimulatorEngine.js";
import { Renderer } from "./Renderer.js";
import { EventHandler } from "./EventHandler.js";
import { SidebarElement } from "./SidebarElement.js";
import { Ball } from "../simulator/Items.js";
import { createVector } from "../simulator/Vector.js";

export class UIHandler {
  canvas: HTMLCanvasElement;
  engine: SimulatorEngine;
  renderer: Renderer;
  eventHandler: EventHandler;
  playing: boolean;
  engineRepetitions: number;
  queuedRepetitions: number;

  // UI Elements (now selected from HTML, not created)
  private speedSlider: HTMLInputElement;
  private speedInput: HTMLInputElement;
  private playPauseButton: HTMLButtonElement;
  private itemsDiv: HTMLDivElement;
  private sidebarElements: Array<SidebarElement> = [];
  
  // Inputs for creating a new item (selected from HTML)
  private newItemPosXInput: HTMLInputElement;
  private newItemPosYInput: HTMLInputElement;
  private newItemVelXInput: HTMLInputElement;
  private newItemVelYInput: HTMLInputElement;
  private newItemMassInput: HTMLInputElement;
  private newItemRadiusInput: HTMLInputElement;
  private newItemColorInput: HTMLInputElement;

  constructor(canvas: HTMLCanvasElement, engine: SimulatorEngine, renderer: Renderer, eventHandler: EventHandler) {
    this.canvas = canvas;
    this.engine = engine;
    this.renderer = renderer;
    this.eventHandler = eventHandler;
    this.playing = false;
    this.engineRepetitions = 1;
    this.queuedRepetitions = 1;

    // --- Select UI elements from the DOM ---
    this.speedInput = document.getElementById("speedInput")! as HTMLInputElement;
    this.speedSlider = document.getElementById("speedSlider")! as HTMLInputElement;
    this.playPauseButton = document.getElementById("playpause")! as HTMLButtonElement;
    this.itemsDiv = document.getElementById("itemsDiv")! as HTMLDivElement;

    // --- Select new item form elements from the DOM ---
    this.newItemPosXInput = document.getElementById("newItemPosX")! as HTMLInputElement;
    this.newItemPosYInput = document.getElementById("newItemPosY")! as HTMLInputElement;
    this.newItemVelXInput = document.getElementById("newItemVelX")! as HTMLInputElement;
    this.newItemVelYInput = document.getElementById("newItemVelY")! as HTMLInputElement;
    this.newItemMassInput = document.getElementById("newItemMass")! as HTMLInputElement;
    this.newItemRadiusInput = document.getElementById("newItemRadius")! as HTMLInputElement;
    this.newItemColorInput = document.getElementById("newItemColor")! as HTMLInputElement;
    
    // Setup listeners for the interactive elements
    this.setupUIListeners();
    this.createInitialSidebarElements();

    // Listen for events from the engine
    this.setupEngineEventListeners();
  }

  private setupUIListeners(): void {
    // --- Simulation Controls ---
    this.speedInput.addEventListener("focusout", this.textFieldChange);
    this.playPauseButton.addEventListener("click", this.togglePlay);

    // --- New Item Button ---
    const addItemButton = document.getElementById("addItemButton")! as HTMLButtonElement;
    addItemButton.addEventListener("click", this.addItem);

    // --- Global Physics Controls ---
    const gravityCheckbox = document.getElementById("gravity")! as HTMLInputElement;
    gravityCheckbox.checked = this.engine.gravity;
    gravityCheckbox.onchange = () => eventBus.dispatch('gravityToggled', gravityCheckbox.checked);
    
    const attractionCheckbox = document.getElementById("attraction")! as HTMLInputElement;
    attractionCheckbox.checked = this.engine.attraction;
    attractionCheckbox.onchange = () => eventBus.dispatch('attractionToggled', attractionCheckbox.checked);
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
      element.update();
    }
  }

  removeElement(e: SidebarElement) {
    let idx = this.sidebarElements.indexOf(e);
    if (idx > -1) {
        this.sidebarElements.splice(idx, 1);
    }
  }

  togglePlay = (evt: Event) => {
    this.playing = !this.playing;
    this.playPauseButton.innerText = this.playing ? "⏸" : "⏵";
  }
  
  getSpeed(x: number) {
    let s = 3;
    if (x >= 0) {
      return s * x + 1;
    } else {
      return Math.exp(s * x);
    }
  }

  getSpeedInverse(x: number) {
    let s = 3;
    if (x >= 1) {
      return (x - 1) / s;
    } else {
      return Math.log(x) / s;
    }
  }

  speedChange = (evt: Event) => {
    this.engineRepetitions = this.getSpeed(Number(this.speedSlider.value));
    this.speedInput.value = this.engineRepetitions.toFixed(2);
  }

  textFieldChange = (evt: FocusEvent) => {
    let value = Number.parseFloat(this.speedInput.value);
    if (isNaN(value)) {
      this.speedInput.value = this.engineRepetitions.toFixed(2);
    } else {
      this.engineRepetitions = value;
      this.speedInput.value = this.engineRepetitions.toFixed(2);
      this.speedSlider.value = this.getSpeedInverse(value).toString();
    }
  }

  draw = () => {
    this.renderer.render();
    if (this.playing) {
      let n = Math.floor(this.queuedRepetitions);
      this.queuedRepetitions -= n;
      for (let i = 0; i < n; i++) {
        this.engine.step();
      }
      this.queuedRepetitions += this.engineRepetitions;
      this.updateSidebar();
    }
    requestAnimationFrame(this.draw);
  }
}