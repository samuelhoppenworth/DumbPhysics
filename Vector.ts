type Vector = {
  x: number
  y: number
}

function Vector(x: number , y: number): Vector {
  return { x:x, y:y }
}

function dot(p1: Vector, p2: Vector): number {
  return p1.x * p2.x + p1.y * p2.y
}

function scale(p: Vector, s: number): Vector {
  return Vector(p.x * s, p.y * s)
}

function magSq(p: Vector): number {
  return dot(p, p)
}
// returns the vector a - b
function sub(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y }
}

// returns the vector a + b
function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y }
}