import { BodyType } from 'matter'
import Game from '../scenes/Game'
import { CollisionCategory, CollisionLabel } from '../utils/Constants'
import { UINumber } from './ui/UINumber'
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
  private static TOUCH_DAMAGE = 10

  public sprite: Phaser.Physics.Matter.Sprite
  private currWalkDirection: WalkDirections
  private isTurning: boolean = false
  private takingDamage: boolean = false
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
        CollisionCategory.ATTACK_HITBOX,
      ])
      .setBounce(0)
      .setPosition(config.position.x, config.position.y)
    ;(this.sprite.body as BodyType).label = CollisionLabel.ENEMY
    this.currWalkDirection =
      Phaser.Math.Between(0, 1) == 0
        ? WalkDirections.LEFT
        : WalkDirections.RIGHT

    this.sprite.setOnCollide((e: any) => {
      const { bodyA, bodyB } = e
      this.handleTurnFromEdge(bodyA, bodyB)
      if (
        bodyA.label === CollisionLabel.PLAYER_ENEMY_SENSOR ||
        bodyB.label === CollisionLabel.PLAYER_ENEMY_SENSOR
      ) {
        this.game.player.takeDamage(Monster.TOUCH_DAMAGE)
      }
    })

    this.sprite.setOnCollideActive((e: any) => {
      const { bodyA, bodyB } = e
      this.handleTurnFromEdge(bodyA, bodyB)
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
    this.sprite.setData('ref', this)
  }

  handleTurnFromEdge(bodyA: BodyType, bodyB: BodyType) {
    if (
      bodyA.label == CollisionLabel.WALLS ||
      bodyB.label == CollisionLabel.WALLS ||
      bodyA.label == CollisionLabel.BOUNDS ||
      bodyB.label == CollisionLabel.BOUNDS
    ) {
      if (!this.isTurning && !this.takingDamage) {
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
  }

  update() {
    if (this.takingDamage) {
      return
    }

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

  takeDamage(damage: number) {
    // this.sprite.setVelocity(-5, -5)
    this.takingDamage = true

    UINumber.createNumber(
      `${damage}`,
      this.game,
      this.sprite.x,
      this.sprite.y - 50,
      false
    )

    this.game.time.delayedCall(500, () => {
      this.takingDamage = false
    })
  }
}
