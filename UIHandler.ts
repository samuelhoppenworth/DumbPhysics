/** Handles all of the webpage interactions (apart from zooming and panning), such as play/pause and adding buttons/objects */
class UIHandler {
  canvas: HTMLCanvasElement
  sidebarDiv: HTMLDivElement
  engine: SimulatorEngine
  renderer: Renderer
  eventHandler: EventHandler
  playing: boolean
  engineRepetitions: number
  queuedRepetitions: number

  //HTML elements
  speedSlider: HTMLInputElement
  speedInput: HTMLInputElement
  playPauseButton: HTMLButtonElement

  // Sidebar elements
  sidebarElements: Array<SidebarElement> = []

  constructor(canvas: HTMLCanvasElement, engine: SimulatorEngine, renderer: Renderer, eventHandler: EventHandler) {
    this.canvas = canvas
    this.engine = engine
    this.renderer = renderer
    this.eventHandler = eventHandler
    this.playing = false
    this.engineRepetitions = 1
    this.queuedRepetitions = 1

    this.speedInput = document.getElementById("speedInput")! as HTMLInputElement
    this.speedInput.addEventListener("focusout", this.textFieldChange)

    this.speedSlider = document.getElementById("speedSlider")! as HTMLInputElement
    this.speedSlider.addEventListener("input", this.speedChange)

    this.playPauseButton = document.getElementById("playpause")! as HTMLButtonElement
    this.playPauseButton.addEventListener("click", this.togglePlay)

    this.sidebarDiv = document.getElementById("sidebar")! as HTMLDivElement

    let titleDiv = document.createElement("div")
    // Make an h2 with the title "editor" and a button to add an item
    let title = document.createElement("h2")
    title.innerText = "Editor"
    title.style.display = "inline-block"
    let addButton = document.createElement("button")
    addButton.innerText = "Add Item"
    addButton.style.display = "inline-block"
    addButton.onclick = this.addItem

    titleDiv.appendChild(title)
    titleDiv.appendChild(addButton)
    this.sidebarDiv.appendChild(titleDiv)
    
    for (let index in this.engine.getItems()) {
      this.sidebarElements.push(new SidebarElement(this.sidebarDiv, Number(index), this.engine, this))
    }

  }

  addItem = () => {
    let item = new Ball(Vector(6, 6), Vector(2, 3), 5.0, 5, "#000000")
    let idx = this.engine.addItem(item)
    this.sidebarElements.push(new SidebarElement(this.sidebarDiv, idx, this.engine, this))
  }

  updateSidebar() {
    for (let element of this.sidebarElements) {
      element.update()
    }
  }

  removeElement(e: SidebarElement) {
    let idx = this.sidebarElements.indexOf(e)
    // this.engine.removeItem(idx)
    this.sidebarElements.splice(idx, 1)
    console.log("New sidebar elements", this.sidebarElements)
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
      console.log("Value: ", value)
      this.engineRepetitions = value
      this.speedInput.value = this.engineRepetitions.toFixed(2)
      this.speedSlider.value = this.getSpeedInverse(value).toString()
    }
  }

  draw = () => {
    this.renderer.render()
    if (this.playing) {
      // Eventually we'll want to interpolate between frames when engineRepetitions < 1 to make it more smooth
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