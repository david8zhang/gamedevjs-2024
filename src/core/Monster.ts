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
  private static HEALTH = 20
  private static WALK_SPEED = 0.5
  private static TOUCH_DAMAGE = 5

  private currWalkDirection: WalkDirections
  private isTurning: boolean = false
  private takingDamage: boolean = false
  private healthbar: UIValueBar

  public sprite: Phaser.Physics.Matter.Sprite
  public id: string
  public isDead: boolean = false
  public isHitboxActive: boolean = false

  constructor(game: Game, config: MonsterConfig) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'monster')
    this.id = Phaser.Utils.String.UUID()
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
        CollisionCategory.PROJECTILE,
      ])
      .setBounce(0)
      .setAlpha(0)
      .setPosition(config.position.x, config.position.y)
    ;(this.sprite.body as BodyType).label = CollisionLabel.ENEMY

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
        this.handleTurnFromEdge()
      }
      if (
        (bodyA.label === CollisionLabel.PLAYER_ENEMY_SENSOR ||
          bodyB.label === CollisionLabel.PLAYER_ENEMY_SENSOR) &&
        this.isHitboxActive &&
        !this.isDead
      ) {
        this.game.player.takeDamage(Monster.TOUCH_DAMAGE)
      }
    })

    this.sprite.setOnCollideActive((e: any) => {
      const { bodyA, bodyB } = e
      if (
        bodyA.label == CollisionLabel.WALLS ||
        bodyB.label == CollisionLabel.WALLS ||
        bodyA.label == CollisionLabel.BOUNDS ||
        bodyB.label == CollisionLabel.BOUNDS
      ) {
        this.handleTurnFromEdge()
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
    this.healthbar.setVisible(false)
    this.game.events.on('update', this.update, this)
    this.sprite.setData('ref', this)

    this.game.tweens.add({
      targets: [this.sprite],
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: Phaser.Math.Easing.Sine.In,
      onComplete: () => {
        this.isHitboxActive = true
      },
    })
  }

  handleTurnFromEdge() {
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

  update() {
    if (this.isDead || !this.sprite.active) {
      return
    }

    this.healthbar.setPosition(
      this.sprite.x - 25,
      this.sprite.y - this.sprite.displayHeight / 2 - 5
    )

    if (this.takingDamage) {
      return
    }

    this.sprite.setFlipX(this.currWalkDirection === WalkDirections.RIGHT)
    this.sprite.setVelocity(
      this.currWalkDirection === WalkDirections.RIGHT
        ? Monster.WALK_SPEED
        : -Monster.WALK_SPEED,
      0
    )
  }

  takeDamage(damage: number) {
    this.healthbar.setVisible(true)
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
    this.healthbar.decrease(damage)
    if (this.healthbar.currValue == 0) {
      this.die()
    }
  }

  die() {
    this.sprite.setVelocity(0, 0)
    this.isDead = true
    this.game.tweens.add({
      targets: [this.sprite],
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        this.sprite.destroy()
        this.healthbar.destroy()
      },
    })
  }
}
