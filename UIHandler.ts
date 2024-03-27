/** Handles all of the webpage interactions (apart from zooming and panning), such as play/pause and adding buttons/objects */
class UIHandler {
  canvas: HTMLCanvasElement
  engine: SimulatorEngine
  renderer: Renderer
  eventHandler: EventHandler
  playing: boolean
  engineRepetitions: number
  queuedRepetitions: number

  constructor(canvas: HTMLCanvasElement, engine: SimulatorEngine, renderer: Renderer, eventHandler: EventHandler) {
    this.canvas = canvas
    this.engine = engine
    this.renderer = renderer
    this.eventHandler = eventHandler
    this.playing = false
    this.engineRepetitions = 1
    this.queuedRepetitions = 1
  }

  togglePlay(button: HTMLButtonElement) {
    this.playing = !this.playing
    button.innerText = this.playing ? "⏸" : "⏵"
  }
  
  getSpeed(x: number) {
    let s = 3
    if (x >= 0) {
      return s*x + 1
    } else {
      return Math.exp(s*x)
    }
  }

  speedChange(slider: HTMLInputElement) {
    // this.engineRepetitions = Math.floor(Number(slider.value))
    this.engineRepetitions = this.getSpeed(Number(slider.value))
    let speedLabel = document.getElementById("speedLabel")! as HTMLParagraphElement
    speedLabel.innerText = " Ticks/Frame: " + this.engineRepetitions.toFixed(2)
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
    }
    requestAnimationFrame(this.draw)
  }
}