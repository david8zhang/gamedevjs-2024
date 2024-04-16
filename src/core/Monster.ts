import Game from '../scenes/Game'
import { CollisionCategory } from '../utils/Constants'

enum WalkDirections {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface MonsterConfig {
  position: {
    x: number
    y: number
  }
}

export class Monster {
  private game: Game
  private static WALK_SPEED = 1.5
  public sprite: Phaser.Physics.Matter.Sprite
  private currWalkDirection: WalkDirections

  constructor(game: Game, config: MonsterConfig) {
    this.game = game

    this.sprite = this.game.matter.add
      .sprite(config.position.x, config.position.y, 'monster')
      .setScale(2)
      .setFixedRotation()
      .setCollisionCategory(CollisionCategory.ENEMY)
      .setCollidesWith([CollisionCategory.FLOOR, CollisionCategory.WALLS])
      .setBounce(0)

    this.currWalkDirection =
      Phaser.Math.Between(0, 1) == 0
        ? WalkDirections.LEFT
        : WalkDirections.RIGHT

    this.sprite.setOnCollide((e: any) => {
      const { bodyA, bodyB } = e
      if (bodyA.label == 'WALLS' || bodyB.label == 'WALLS') {
        this.sprite.setFlipX(this.currWalkDirection === WalkDirections.RIGHT)
        this.currWalkDirection =
          this.currWalkDirection === WalkDirections.LEFT
            ? WalkDirections.RIGHT
            : WalkDirections.LEFT
      }
    })

    this.game.events.on('update', this.update, this)
  }

  update() {
    if (this.sprite.getVelocity().x! > 0) {
      this.sprite.setFlipX(true)
    }
    this.sprite.setVelocity(
      this.currWalkDirection === WalkDirections.RIGHT
        ? Monster.WALK_SPEED
        : -Monster.WALK_SPEED,
      0
    )
  }
}
