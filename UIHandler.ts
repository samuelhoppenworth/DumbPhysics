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

    for (let item of this.engine.getItems()) {
      this.sidebarElements.push(new SidebarElement(item, this.sidebarDiv))
    }
  }

  addSidebarButton(item: Item & Collidable) {
    let section = document.createElement("div")
    let child1 = document.createElement("p")

    child1.innerText = `Mass: ${item.mass}, Radius: ${item.minRadius}`
    section.appendChild(child1)
    let child2 = document.createElement("p")
    child2.innerHTML = `Position: (${item.position.x}, ${item.position.y})`
    section.appendChild(child2)
    this.sidebarDiv.appendChild(section)
  }

  updateSidebar() {
    let items = this.engine.getItems()
    for (let i in items) {
      this.sidebarElements[i].update(items[i])
    }
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