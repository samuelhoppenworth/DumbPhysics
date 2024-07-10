interface Item {
  velocity: Vector
  // this is assumed to the the position of the center of mass of the item
  position: Vector
  mass: number
  selected: boolean
  // items are given the scale of the canvas and where their center should be.
  // They are not in charge of determining their position; the renderer is
  // NOTE: This should draw the item upside-down, since the canvas's y-axis is inverted
  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number): void

  containsPoint(pt: Vector): boolean
}

interface Rotatable {
  // angular velocity in radians per second
  angularVelocity: number
  // this is the angle in radians
  angle: number
  // this is the moment of inertia
  I: number
}

interface Collidable {
  // hopefully we'll be able to implement rigid body dynamics, in which case this method will be
  // much more important. For now, we only use it to detect collisions with the boundary.
  intersectsSegment(p1: Vector, p2: Vector): boolean
  minRadius: number
}

function ccw(A: Vector, B: Vector, C: Vector) {
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x)
}

function segmentsIntersect(A: Vector ,B: Vector,C:Vector,D:Vector) {
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D)
}

class Ball implements Item, Collidable {
  velocity: Vector
  position: Vector
  mass: number
  radius: number
  color: string
  selected: boolean = false
  minRadius: number

  constructor(position: Vector = Vector(6, 6), velocity: Vector = Vector(2, 3), mass: number = 5.0, radius: number = 2, color: string = "black") {
    this.position = position
    this.velocity = velocity
    this.mass = mass
    this.radius = radius
    this.color = color
    this.minRadius = radius
  }

  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number) {
    ctx.beginPath()
    ctx.arc(center.x, center.y, this.radius * scale, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = this.color
    ctx.fill()
    if (!this.selected) return
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.arc(center.x, center.y, this.radius * scale, 0, 2*Math.PI)
    ctx.closePath()
    ctx.strokeStyle = "blue"
    ctx.stroke()
  }

  containsPoint(pt: Vector): boolean {
    return magSq(sub(pt, this.position)) <= this.radius * this.radius
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

class RigidBody implements Item, Collidable {
  velocity: Vector
  position: Vector
  mass: number
  selected: boolean
  minRadius: number

  // this is the angle in radians
  angle: number
  // this is the moment of inertia
  I: number
  // angular velocity in radians per second
  angularVelocity: number
  // the vertices of the polygon, in the local frame
  vertices: Array<Vector>

  // the color of the polygon
  color: string

  constructor(position: Vector = Vector(6, 6), velocity: Vector = Vector(2, 3), mass: number = 5.0, angle: number = 0, angularVelocity: number = 0, vertices: Array<Vector>, color: string = "black") {
    this.position = position
    this.velocity = velocity
    this.mass = mass
    this.angle = angle
    this.angularVelocity = angularVelocity
    this.vertices = vertices
    this.color = color
    
    this.minRadius = 0
    for (let vertex of vertices) {
      let dist = magSq(vertex)
      if (dist > this.minRadius) this.minRadius = dist
    }
    this.minRadius = Math.sqrt(this.minRadius)
  }
  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number): void {
    ctx.moveTo(center.x + this.vertices[0].x * scale, center.y + this.vertices[0].y * scale)
    ctx.beginPath()
    for (let i = 0; i < this.vertices.length; i++) {
      let worldVector = this.rotateVector(this.vertices[i], this.angle)
      ctx.lineTo(center.x + worldVector.x * scale, center.y - worldVector.y * scale)
    }
    ctx.closePath()
    ctx.fillStyle = this.color
    ctx.fill()
  }

  rotateVector(v: Vector, theta: number): Vector {
    let cosTheta = Math.cos(theta)
    let sinTheta = Math.sin(theta)
    return Vector(v.x * cosTheta - v.y * sinTheta, v.x * sinTheta + v.y * cosTheta)
  }
  

  intersectsSegment(p1: Vector, p2: Vector): boolean {
    for (let i = 0; i < this.vertices.length; i++) {
      let j = (i + 1) % this.vertices.length
      let vertex1 = this.rotateVector(this.vertices[i], this.angle)
      let vertex2 = this.rotateVector(this.vertices[j], this.angle)
      if (segmentsIntersect(add(vertex1, this.position), add(vertex2, this.position), p1, p2)) return true
    }
    return false
  }
  containsPoint(pt: Vector): boolean {
    return false
  }
}