interface Item {
  velocity: Vector
  // this is assumed to the the position of the center of mass of the item
  position: Vector
  mass: number
  // items are given the scale of the canvas and where their center should be.
  // They are not in charge of determining their position; the renderer is
  // NOTE: This should draw the item upside-down, since the canvas's y-axis is inverted
  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number): void
  
}

interface Collidable {
  // hopefully we'll be able to implement rigid body dynamics, in which case this method will be
  // much more important. For now, we only use it to detect collisions with the boundary.
  intersectsSegment(p1: Vector, p2: Vector): boolean
}

class Ball implements Item, Collidable {
  velocity: Vector
  position: Vector
  mass: number
  radius: number

  constructor(position: Vector = Vector(6, 6), velocity: Vector = Vector(2, 3), mass: number = 5.0, radius: number = 2) {
    this.position = position
    this.velocity = velocity
    this.mass = mass
    this.radius = radius
  }

  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number) {
    ctx.beginPath()
    ctx.arc(center.x, center.y, this.radius * scale, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
  }

  intersectsSegment(p1: Vector, p2: Vector): boolean {
    let rp1 = sub(p1, this.position)
    let rp2 = sub (p2, this.position)
    let radiusSq = this.radius * this.radius
    // check if collision is at the vertices
    if (magSq(rp1) <= radiusSq || magSq(rp2) <= radiusSq) {
      return true
    }

    let v12 = sub(p1, p2)

    // project the difference vectors onto the line segment
    let projection1 = scale(v12, dot(rp1, v12) / magSq(v12))
    let projection2 = scale(v12, dot(rp2, v12) / magSq(v12))
    // if the ball is not between the two points, we return false.
    // This happens when the projection vectors from the ball to the points are in the same direction (when their dot product is positive)
    if (dot(projection1, projection2) > 0) {
      return false
    }

    // the vector straight from the ball to the segment; the shortest distance.
    let altitudeVec = sub(rp1, projection1)
    return magSq(altitudeVec) <= radiusSq
  }
}