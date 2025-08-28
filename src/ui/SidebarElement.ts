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

    this.cardDiv = document.createElement("div");
    this.cardDiv.className = "item-card";
    const header = document.createElement("div");
    header.className = "item-card-header";
    this.thumbnail = document.createElement("canvas");
    this.thumbnail.width = this.thumbnailWidth;
    this.thumbnail.height = this.thumbnailWidth;
    this.thumbnail.className = "thumbnail";
    this.drawThumbnail(item);
    
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "item-controls";

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

    const body = document.createElement("div");
    body.className = "form-grid";
    
    this.massInput = this.handler.makeScalarInput(body, "Mass", "mass", this.index);
    if (item instanceof Ball) {
      this.radiusInput = this.handler.makeScalarInput(body, "Radius", "radius", this.index);
    }

    [this.positionInputX, this.positionInputY] = this.handler.makeVectorInput(body, "Position", "position", this.index);
    [this.velocityInputX, this.velocityInputY] = this.handler.makeVectorInput(body, "Velocity", "velocity", this.index);

    this.cardDiv.appendChild(body);
    this.parent.appendChild(this.cardDiv);
  }

  drawThumbnail(item: Item & Collidable) {
    let ctx = this.thumbnail.getContext("2d")!;
    ctx.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height);
    let itemScale = 20 / item.minRadius;
    item.draw(ctx, createVector(25, 25), itemScale);
  }

  update() {
    let item = this.engine.getItem(this.index);
    if (!item) return;

    if (document.activeElement !== this.massInput) this.massInput.value = item.mass.toFixed(2);
    if (item instanceof Ball && document.activeElement !== this.radiusInput) {
      this.radiusInput.value = item.minRadius.toFixed(2);
    }
    
    if (document.activeElement !== this.positionInputX) this.positionInputX.value = item.position.x.toFixed(2);
    if (document.activeElement !== this.positionInputY) this.positionInputY.value = item.position.y.toFixed(2);
    if (document.activeElement !== this.velocityInputX) this.velocityInputX.value = item.velocity.x.toFixed(2);
    if (document.activeElement !== this.velocityInputY) this.velocityInputY.value = item.velocity.y.toFixed(2);

    this.drawThumbnail(item);
  }
}