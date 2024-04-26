import { BodyType } from 'matter'
import Game from '../scenes/Game'
import { CollisionCategory, CollisionLabel } from '../utils/Constants'
import { UINumber } from './ui/UINumber'
import { UIValueBar } from './ui/UIValueBar'

const ENEMY_TYPES: { [key: string]: any } = {
  'enemy-squiggle': {
    texture: 'enemy-squiggle',
    damagePct: 0.25,
    expReward: 100,
    hitboxScale: {
      width: 2,
      height: 2,
    },
    anims: {
      move: 'squiggle-move',
    },
    maxHealth: 100,
  },
  'enemy-beetle': {
    texture: 'enemy-beetle',
    damagePct: 0.1,
    expReward: 50,
    hitboxScale: {
      width: 1.5,
      height: 1.5,
    },
    anims: {
      move: 'beetle-move',
    },
    maxHealth: 50,
  },
  'enemy-snail': {
    texture: 'enemy-snail',
    damagePct: 0.05,
    expReward: 5,
    scale: 3,
    hitboxScale: {
      width: 1,
      height: 1,
    },
    anims: {
      move: 'snail-move',
    },
    maxHealth: 15,
  },
}

enum WalkDirections {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface MonsterConfig {
  position: {
    x: number
    y: number
  }
  enemyType: string
}

export class Monster {
  private game: Game
  private static WALK_SPEED = 0.5

  private currWalkDirection: WalkDirections
  private isTurning: boolean = false
  private takingDamage: boolean = false
  private healthbar: UIValueBar

  public sprite: Phaser.Physics.Matter.Sprite
  public id: string
  public isDead: boolean = false
  public isHitboxActive: boolean = false
  public expReward: number = 5
  private damagePlayerHpPct = 0
  private moveAnimKey: string
  private maxHealth: number = 0

  constructor(game: Game, config: MonsterConfig) {
    this.game = game
    const enemyType = ENEMY_TYPES[config.enemyType]

    this.moveAnimKey = enemyType.anims.move
    this.damagePlayerHpPct = enemyType.damagePct
    this.expReward = enemyType.expReward
    this.maxHealth = enemyType.maxHealth

    this.sprite = this.game.matter.add.sprite(0, 0, enemyType.texture)
    this.id = Phaser.Utils.String.UUID()

    const { Bodies } = (Phaser.Physics.Matter as any).Matter as typeof MatterJS
    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth * enemyType.hitboxScale.width,
      this.sprite.displayHeight * enemyType.hitboxScale.height
    )

    this.sprite
      .setExistingBody(mainBody as BodyType)
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

    const body = this.sprite.body as BodyType
    body.label = CollisionLabel.ENEMY

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
        if (!this.game.player.isTurboCharged) {
          this.game.player.takeDamage(
            Math.round(this.game.player.maxHealth * this.damagePlayerHpPct)
          )
        }
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
      maxValue: this.maxHealth,
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

    this.sprite.play(this.moveAnimKey, true)
    this.sprite.setFlipX(this.currWalkDirection === WalkDirections.LEFT)
    this.sprite.setVelocity(
      this.currWalkDirection === WalkDirections.RIGHT
        ? Monster.WALK_SPEED
        : -Monster.WALK_SPEED,
      0
    )
  }

  takeDamage(damage: number, isTurboCharged: boolean) {
    this.game.sound.play('impact', { volume: 0.5 })
    this.healthbar.setVisible(true)
    this.takingDamage = true
    UINumber.createNumber(
      `${damage}`,
      this.game,
      this.sprite.x,
      this.sprite.y - 50,
      false,
      isTurboCharged
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
    if (this.game.player.isTurboCharged) {
      this.game.player.restoreHealth(5)
    } else {
      this.game.player.incrementCombo()
    }
    this.game.player.addExp(this.expReward)
  }
}
