// A class that stores handles to all the UI elements for a specific item in the sidebar
class SidebarElement {
  private sectionDiv: HTMLDivElement
  private positionLabel: HTMLParagraphElement
  private velocityLabel: HTMLParagraphElement
  private thumbnail: HTMLCanvasElement

  constructor(item: Item & Collidable, parent: HTMLDivElement) {
    this.sectionDiv = document.createElement("div")
    this.positionLabel = document.createElement("p")
    this.positionLabel.innerText = `Position: (${item.position.x.toFixed(2)}, ${item.position.y.toFixed(2)})`
    this.velocityLabel = document.createElement("p")
    this.velocityLabel.innerText = `Velocity: (${item.velocity.x.toFixed(2)}, ${item.velocity.y.toFixed(2)})`
    this.thumbnail = document.createElement("canvas")
    this.thumbnail.width = 60
    this.thumbnail.height = 60
    this.thumbnail.style.border = "1px solid black"
    this.drawThumbnail(item)
    this.sectionDiv.appendChild(this.thumbnail)
    this.sectionDiv.appendChild(this.positionLabel)
    this.sectionDiv.appendChild(this.velocityLabel)
    parent.appendChild(this.sectionDiv)
  }

  drawThumbnail(item: Item & Collidable) {
    let ctx = this.thumbnail.getContext("2d")!
    ctx.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height)
    let itemScale = 25 / item.minRadius
    item.draw(ctx, Vector(30, 30), itemScale)
  }

  update(item: Item & Collidable) {
    this.positionLabel.innerText = `Position: (${item.position.x.toFixed(2)}, ${item.position.y.toFixed(2)})`
    this.velocityLabel.innerText = `Velocity: (${item.velocity.x.toFixed(2)}, ${item.velocity.y.toFixed(2)})`
    this.drawThumbnail(item)
  }
}