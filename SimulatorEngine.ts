class Constants {
  static bigG: number = 6.674e-11
}

class SimulatorEngine {
  private items: Array<(Item & Collidable) | null> = []
  private allItems: Array<Item & Collidable> = []
  private collisionFlags: Array<boolean> = []
  timestep: number = 0.1967
  gravity: boolean = true
  attraction: boolean = false
  boxWidth: number = 500
  boxHeight: number = 200
  time: number = 0

  step() {
    // move them forward
    for (let i in this.items) {
      let item = this.items[i]
      if (item == null) continue
      this.collisionFlags[i] = false
      item.position = add(item.position, scale(item.velocity, this.timestep))
      if (item instanceof RigidBody) {
        item.angle += item.angularVelocity * this.timestep
      }
    }
    this.processAllCollisions()
    // apply forces and collisions
    for (let i in this.items) {
      let item = this.items[i]
      // applying forces like gravity after collision has weird consequences, like a loss of conservation of energy.
      if (item == null || this.collisionFlags[i]) {
        continue
      }
      let force = this.resolveForce(item)
      let acceleration = scale(force, 1/item.mass)
      item.velocity = add(item.velocity, scale(acceleration, this.timestep))
    }
    this.time += this.timestep
  }

  removeItem(at: number) {
    let item = this.items[at]
    console.log("Item to remove: ", item)
    this.items[at] = null
    let idx = this.allItems.indexOf(item!)
    this.allItems.splice(idx, 1)
  }

  addItem(item: Item & Collidable): number {
    this.allItems.push(item)
    for (let i in this.items) {
      if (this.items[i] == null) {
        this.items[i] = item
        this.collisionFlags[i] = false
        return Number(i)
      }
    }
    this.items.push(item)
    this.collisionFlags.push(false)
    return this.items.length - 1
  }

  getItem(index: number): Item & Collidable {
    if (this.items[index] == null) throw new Error("Item does not exist")
    return this.items[index]!
  }

  getItems(): Array<Item & Collidable> {
    return this.allItems
  }

  private checkWallCollisions(item: Item & Collidable): boolean {
    let box00 = Vector(0, 0)
    let box01 = Vector(0, this.boxHeight)
    let box10 = Vector(this.boxWidth, 0)
    let box11 = Vector(this.boxWidth, this.boxHeight)
    let collision = false
    if (item.intersectsSegment(box00, box10) || item.position.y < 0) {
      if (item.velocity.y < 0) {
        item.velocity.y *= -1
        collision = true
      }
    }
    if (item.intersectsSegment(box01, box11) || item.position.y > this.boxHeight ) {
      if (item.velocity.y > 0) {
        item.velocity.y *= -1
        collision = true
      }
    }
    if (item.intersectsSegment(box00, box01) || item.position.x < 0) {
      if (item.velocity.x < 0) {
        item.velocity.x *= -1
        collision = true
      }
    }
    if (item.intersectsSegment(box10, box11) || item.position.x > this.boxWidth) {
      console.log("Collision of", item["color"])
      if (item.velocity.x > 0) {
        item.velocity.x *= -1
        collision = true
      }
    }
    return collision
  }

  private processAllCollisions() {
    for (let i = 0; i < this.items.length; i++) {
      let item = this.items[i]
      if (item == null) continue
      if (this.checkWallCollisions(item)) this.collisionFlags[i] = true
      for (let j = i + 1; j < this.items.length; j++) {
        let other = this.items[j]
        if (item instanceof Ball && other instanceof Ball) {
          let diff = sub(item.position, other.position)
          // they must also be moving towards each other
          if (dot(diff, sub(item.velocity, other.velocity)) > 0) {
            continue
          }
          let distance = Math.sqrt(magSq(diff))
          if (distance <= (item.radius + other.radius)) {
            let normal = scale(diff, 1/distance)
            let v1 = dot(item.velocity, normal)
            let v2 = dot(other.velocity, normal)

            let m1 = item.mass
            let m2 = other.mass
            let u1 = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2)
            let u2 = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2)
            let v1f = add(item.velocity, scale(normal, u1 - v1))
            let v2f = add(other.velocity, scale(normal, u2 - v2))
            item.velocity = v1f
            other.velocity = v2f
            this.collisionFlags[i] = true
            this.collisionFlags[j] = true
          }
        }
      }
    }
  }

  private resolveForce(item: Item): Vector {
    let netForce: Vector = Vector(0, 0)
    if (this.gravity) {
      netForce = Vector(0, -item.mass)
    } else {
      netForce = Vector(0, 0)
    }
    if (this.attraction) {
      netForce = add(netForce, this.resolveAttraction(item))
    }
    return netForce
  }

  private resolveAttraction(item: Item): Vector {
    let attractiveForce: Vector = Vector(0, 0)
    for (let other of this.items) {
      if (other == null || other == item) continue
      let diff = sub(other.position, item.position)
      let dist = Math.sqrt(magSq(diff))
      let strength = Constants.bigG * item.mass * other.mass / (dist * dist * dist)
      attractiveForce = add(attractiveForce, scale(diff,  strength))
    }
    return attractiveForce
  }

  editProperty(name: string, index: number, newValue: number) {
    let item = this.items[index]
    if (item == null) {
      console.error("Cannot edit property of null item")
      return
    }
    switch (name) {
      case "mass":
        item.mass = newValue;
        break;
      case "positionX":
        item.position.x = newValue;
        break;
      case "positionY":
        item.position.y = newValue;
        break;
      case "velocityX":
        item.velocity.x = newValue;
        break;
      case "velocityY":
        item.velocity.y = newValue;
        break;  
      case "radius":
        if (item instanceof Ball) {
          item.radius = newValue;
          item.minRadius = newValue;
        } else {
          console.error("Cannot set radius of non-ball object")
        }
        break;
    } 
  }

}