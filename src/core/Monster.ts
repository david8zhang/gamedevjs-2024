import Game from '../scenes/Game'
import { CollisionCategory, CollisionLabel } from '../utils/Constants'

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
  private isTurning: boolean = false

  constructor(game: Game, config: MonsterConfig) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'monster')
    this.sprite
      .setScale(2)
      .setFixedRotation()
      .setCollisionCategory(CollisionCategory.ENEMY)
      .setCollidesWith([
        CollisionCategory.FLOOR,
        CollisionCategory.WALLS,
        CollisionCategory.BOUNDS,
      ])
      .setBounce(0)
      .setPosition(config.position.x, config.position.y)

    this.currWalkDirection =
      Phaser.Math.Between(0, 1) == 0
        ? WalkDirections.LEFT
        : WalkDirections.RIGHT

    this.sprite.setOnCollide((e: any) => {
      const { bodyA, bodyB } = e
      if (
        bodyA.label == CollisionLabel.WALLS ||
        bodyB.label == CollisionLabel.WALLS ||
        bodyA.label == CollisionLabel.BOUNDS ||
        bodyB.label == CollisionLabel.BOUNDS
      ) {
        if (!this.isTurning) {
          this.isTurning = true
          this.game.time.delayedCall(100, () => {
            this.isTurning = false
          })
          this.currWalkDirection =
            this.currWalkDirection === WalkDirections.LEFT
              ? WalkDirections.RIGHT
              : WalkDirections.LEFT
        }
      }
    })

    this.game.events.on('update', this.update, this)
  }

  update() {
    this.sprite.setFlipX(this.currWalkDirection === WalkDirections.RIGHT)
    this.sprite.setVelocity(
      this.currWalkDirection === WalkDirections.RIGHT
        ? Monster.WALK_SPEED
        : -Monster.WALK_SPEED,
      0
    )
  }
}
