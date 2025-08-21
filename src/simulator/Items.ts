import { Vector, createVector, magSq, sub, add, dot, scale } from "./Vector.js";

export interface Item {
  velocity: Vector
  position: Vector
  mass: number
  selected: boolean
  draw(ctx: CanvasRenderingContext2D, center: Vector, scale: number): void
  containsPoint(pt: Vector): boolean
}

export interface Rotatable {
  angularVelocity: number
  angle: number
  I: number
}

export interface Collidable {
  intersectsSegment(p1: Vector, p2: Vector): boolean
  minRadius: number
}

export function ccw(A: Vector, B: Vector, C: Vector) {
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x)
}

export function segmentsIntersect(A: Vector ,B: Vector,C:Vector,D:Vector) {
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D)
}

export class Ball implements Item, Collidable {
  velocity: Vector
  position: Vector
  mass: number
  radius: number
  color: string
  selected: boolean = false
  minRadius: number

  constructor(position: Vector = createVector(6, 6), velocity: Vector = createVector(2, 3), mass: number = 5.0, radius: number = 2, color: string = "black") {
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
    if (magSq(rp1) <= radiusSq || magSq(rp2) <= radiusSq) {
      return true
    }

    let v12 = sub(p1, p2)
    let projection1 = scale(v12, dot(rp1, v12) / magSq(v12))
    let projection2 = scale(v12, dot(rp2, v12) / magSq(v12))
    if (dot(projection1, projection2) > 0) {
      return false
    }
    let altitudeVec = sub(rp1, projection1)
    return magSq(altitudeVec) <= radiusSq
  }
}

export class RigidBody implements Item, Collidable {
  velocity: Vector
  position: Vector
  mass: number
  selected: boolean = false;
  minRadius: number
  angle: number
  I: number
  angularVelocity: number
  vertices: Array<Vector>
  color: string

  constructor(position: Vector = createVector(6, 6), velocity: Vector = createVector(2, 3), mass: number = 5.0, angle: number = 0, angularVelocity: number = 0, vertices: Array<Vector>, color: string = "black") {
    this.position = position
    this.velocity = velocity
    this.mass = mass
    this.angle = angle
    this.angularVelocity = angularVelocity
    this.vertices = vertices
    this.color = color
    
    this.minRadius = 0
    let inertiaSum = 0;
    for (let vertex of vertices) {
      let distSq = magSq(vertex)
      if (distSq > this.minRadius) this.minRadius = distSq
      inertiaSum += distSq;
    }
    this.minRadius = Math.sqrt(this.minRadius)
    this.I = this.mass * inertiaSum / vertices.length;
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
    return createVector(v.x * cosTheta - v.y * sinTheta, v.x * sinTheta + v.y * cosTheta)
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