import Game from '../scenes/Game'
import { CollisionCategory, CollisionLabel } from '../utils/Constants'
import { UIValueBar } from './ui/UIValueBar'

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
  private static HEALTH = 10
  private static WALK_SPEED = 1.5
  public sprite: Phaser.Physics.Matter.Sprite
  private currWalkDirection: WalkDirections
  private isTurning: boolean = false
  private healthbar: UIValueBar

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
        CollisionCategory.PLAYER_ENEMY_SENSOR,
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

      if (
        bodyA.label === CollisionLabel.PLAYER_ENEMY_SENSOR ||
        bodyB.label === CollisionLabel.PLAYER_ENEMY_SENSOR
      ) {
        console.log('player take damage!')
      }
    })

    this.healthbar = new UIValueBar(this.game, {
      x: this.sprite.x - 25,
      y: this.sprite.y - this.sprite.displayHeight / 2 - 5,
      width: 50,
      height: 5,
      maxValue: Monster.HEALTH,
      borderWidth: 2,
      radius: 0,
    })
    this.game.events.on('update', this.update, this)
  }

  update() {
    this.healthbar.setPosition(
      this.sprite.x - 25,
      this.sprite.y - this.sprite.displayHeight / 2 - 5
    )

    this.sprite.setFlipX(this.currWalkDirection === WalkDirections.RIGHT)
    this.sprite.setVelocity(
      this.currWalkDirection === WalkDirections.RIGHT
        ? Monster.WALK_SPEED
        : -Monster.WALK_SPEED,
      0
    )
  }
}
