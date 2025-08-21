export type Vector = {
  x: number
  y: number
}

export function createVector(x: number , y: number): Vector {
  return { x:x, y:y }
}

export function dot(p1: Vector, p2: Vector): number {
  return p1.x * p2.x + p1.y * p2.y
}

export function scale(p: Vector, s: number): Vector {
  return createVector(p.x * s, p.y * s)
}

export function magSq(p: Vector): number {
  return dot(p, p)
}
// returns the vector a - b
export function sub(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y }
}

// returns the vector a + b
export function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y }
}
export function cross(a: Vector, b: Vector): number {
  return a.x * b.y - a.y * b.x
}