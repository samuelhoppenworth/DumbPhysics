import { eventBus } from "../core/EventBus.js";
import { SimulatorEngine } from "../simulator/SimulatorEngine.js";
import { UIHandler } from "./UIHandler.js";
import { Item, Collidable, Ball, RigidBody } from "../simulator/Items.js";
import { Vector, createVector } from "../simulator/Vector.js";

export class SidebarElement {
  private engine: SimulatorEngine;
  index: number;
  private parent: HTMLDivElement;
  private handler: UIHandler;
  
  // DOM Elements for the card
  private cardDiv: HTMLDivElement;
  private deleteButton: HTMLButtonElement;
  private massInput: HTMLInputElement;
  private radiusInput!: HTMLInputElement; 
  private positionInputX: HTMLInputElement;
  private positionInputY: HTMLInputElement;
  private velocityInputX: HTMLInputElement;
  private velocityInputY: HTMLInputElement;
  private colorInput!: HTMLInputElement;
  private thumbnail: HTMLCanvasElement;
  private thumbnailWidth: number = 50;

  constructor(parent: HTMLDivElement, index: number, engine: SimulatorEngine, handler: UIHandler) {
    this.handler = handler;
    this.index = index;
    this.engine = engine;
    this.parent = parent;

    let item = this.engine.getItem(this.index);

    // --- Main Card Container ---
    this.cardDiv = document.createElement("div");
    this.cardDiv.className = "item-card";

    // --- Card Header ---
    const header = document.createElement("div");
    header.className = "item-card-header";

    this.thumbnail = document.createElement("canvas");
    this.thumbnail.width = this.thumbnailWidth;
    this.thumbnail.height = this.thumbnailWidth;
    this.thumbnail.className = "thumbnail";
    this.drawThumbnail(item);
    
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "item-controls";

    // Color Input
    if (item instanceof Ball || item instanceof RigidBody) {
      this.colorInput = document.createElement("input");
      this.colorInput.type = "color";
      this.colorInput.className = "color-input";
      this.colorInput.value = item.color;
      this.colorInput.oninput = () => {
        eventBus.dispatch('itemPropertyChanged', {
          itemIndex: this.index,
          property: 'color',
          newValue: this.colorInput.value
        });
        this.drawThumbnail(this.engine.getItem(this.index));
      };
      controlsContainer.appendChild(this.colorInput);
    }

    this.deleteButton = document.createElement("button");
    this.deleteButton.className = "delete-button";
    this.deleteButton.innerText = "X";
    this.deleteButton.onclick = () => {
      eventBus.dispatch('removeItem', this.index);
      this.cardDiv.remove();
      this.handler.removeElement(this);
    };

    header.appendChild(this.thumbnail);
    header.appendChild(controlsContainer);
    header.appendChild(this.deleteButton);
    this.cardDiv.appendChild(header);

    // --- Card Body (Form Grid) ---
    const body = document.createElement("div");
    body.className = "form-grid";
    
    this.massInput = this.makeScalarInput(body, "Mass", "mass");
    if (item instanceof Ball) {
      this.radiusInput = this.makeScalarInput(body, "Radius", "radius");
    }

    [this.positionInputX, this.positionInputY] = this.makeVectorInput(body, "Position", "position");
    [this.velocityInputX, this.velocityInputY] = this.makeVectorInput(body, "Velocity", "velocity");

    this.cardDiv.appendChild(body);
    this.parent.appendChild(this.cardDiv);
  }

  private makeScalarInput(container: HTMLElement, labelText: string, property: string): HTMLInputElement {
    const item = this.engine.getItem(this.index);
    
    const label = document.createElement("label");
    label.innerText = labelText;
    
    const input = document.createElement("input");
    input.type = "number";
    const value = (item as any)[property] ?? item.minRadius;
    input.placeholder = value.toFixed(2);
    input.oninput = () => eventBus.dispatch('itemPropertyChanged', {
      itemIndex: this.index,
      property: property,
      newValue: input.value
    });
    
    container.appendChild(label);
    container.appendChild(input);
    return input;
  }

  private makeVectorInput(container: HTMLElement, labelText: string, property: string): [HTMLInputElement, HTMLInputElement] {
    const item = this.engine.getItem(this.index);
    
    const label = document.createElement("label");
    label.innerText = `${labelText} (x, y)`;
    
    const inputsWrapper = document.createElement("div");
    inputsWrapper.className = "vector-inputs";
    
    const inputX = document.createElement("input");
    inputX.type = "number";
    inputX.placeholder = (item as any)[property].x.toFixed(2);
    inputX.oninput = () => eventBus.dispatch('itemPropertyChanged', {
      itemIndex: this.index,
      property: `${property}X`,
      newValue: inputX.value
    });

    const inputY = document.createElement("input");
    inputY.type = "number";
    inputY.placeholder = (item as any)[property].y.toFixed(2);
    inputY.oninput = () => eventBus.dispatch('itemPropertyChanged', {
      itemIndex: this.index,
      property: `${property}Y`,
      newValue: inputY.value
    });
    
    inputsWrapper.appendChild(inputX);
    inputsWrapper.appendChild(inputY);
    container.appendChild(label);
    container.appendChild(inputsWrapper);
    
    return [inputX, inputY];
  }

  drawThumbnail(item: Item & Collidable) {
    let ctx = this.thumbnail.getContext("2d")!;
    ctx.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height);
    let itemScale = 20 / item.minRadius;
    item.draw(ctx, createVector(25, 25), itemScale);
  }

  update() {
    let item = this.engine.getItem(this.index);
    if (!item) return; // Item might have been removed

    if (item instanceof Ball) {
      this.radiusInput.placeholder = item.minRadius.toFixed(2);
    }
    this.massInput.placeholder = item.mass.toFixed(2);
    
    // Only update placeholders if the user isn't focused on the input
    if (document.activeElement !== this.positionInputX) this.positionInputX.value = item.position.x.toFixed(2);
    if (document.activeElement !== this.positionInputY) this.positionInputY.value = item.position.y.toFixed(2);
    if (document.activeElement !== this.velocityInputX) this.velocityInputX.value = item.velocity.x.toFixed(2);
    if (document.activeElement !== this.velocityInputY) this.velocityInputY.value = item.velocity.y.toFixed(2);

    this.drawThumbnail(item);
  }
}