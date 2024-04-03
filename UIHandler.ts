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
    let textField = document.getElementById("speedInput")! as HTMLInputElement
    textField.addEventListener("focusout", this.textFieldChange)
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

  getSpeedInverse(x: number) {
    let s = 3
    if (x >= 1) {
      return (x - 1) / s
    } else {
      return Math.log(x) / s
    }
  }

  speedChange(slider: HTMLInputElement) {
    this.engineRepetitions = this.getSpeed(Number(slider.value))
    let speedLabel = document.getElementById("speedInput")! as HTMLInputElement
    speedLabel.value = this.engineRepetitions.toFixed(2)
  }

  textFieldChange = (evt: FocusEvent) => {
    let textField = evt.target as HTMLInputElement
    let value = Number.parseFloat(textField.value)
    if (Number.isNaN(value)) {
      textField.value = this.engineRepetitions.toFixed(2)
    } else {
      console.log("Value: ", value)
      this.engineRepetitions = value
      let slider = document.getElementById("speedSlider")! as HTMLInputElement
      slider.value = this.getSpeedInverse(value).toString()
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
    }
    requestAnimationFrame(this.draw)
  }
}