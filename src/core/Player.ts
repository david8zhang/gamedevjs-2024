import { BodyType } from 'matter'
import Game from '../scenes/Game'
import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../utils/Constants'
import { InputController } from './InputController'
import { UI } from '../scenes/UI'
import { UINumber } from './ui/UINumber'
import { AttackSprite } from './AttackSprite'
import { Projectile } from './Projectile'
import { ActionIcon } from './ui/ActionIcon'

export class Player {
  private static SPAWN_POSITION = {
    x: 50,
    y: Constants.GAME_HEIGHT - 40,
  }
  private static SPEED = 3
  private static JUMP_VELOCITY = 10
  private static DASH_DISTANCE = 150
  public static DAMAGE = 5
  public static PROJECTILE_DAMAGE = 5

  public static DOUBLE_JUMP_COOLDOWN_MS = 2000
  public static DASH_COOLDOWN_MS = 4000
  public static PROJECTILE_COOLDOWN_MS = 1000

  private game: Game

  public sprite: Phaser.Physics.Matter.Sprite
  public mainBody!: BodyType
  public enemyDetector!: Phaser.Physics.Matter.Sprite
  public inputController!: InputController
  public attackAnimMap: { [key: string]: AttackSprite } = {}
  public isInvincible: boolean = false
  public isAttacking: boolean = false
  public isDead: boolean = false
  public animQueue: string[] = []

  // Dash
  public isDashing: boolean = false
  public dashOnCooldown: boolean = false

  // Jump
  public doubleJumpOnCooldown: boolean = false

  // Projectile
  public projectileCooldown: boolean = false

  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'player')

    // Setup body & sensors
    this.setupGroundSensor()
    this.setupEnemySensor()

    this.inputController = new InputController(this.game, {
      player: this,
      speed: Player.SPEED,
      jumpVelocity: Player.JUMP_VELOCITY,
      dashDistance: Player.DASH_DISTANCE,
    })

    this.game.events.on('update', () => {
      if (this.sprite.active) {
        this.enemyDetector.setPosition(this.sprite.x, this.sprite.y - 20)
        const velocity = this.sprite.getVelocity()
        if (velocity.y! < 0) {
          this.mainBody.collisionFilter.mask = CollisionCategory.BOUNDS
        } else {
          this.mainBody.collisionFilter.mask =
            CollisionCategory.BOUNDS | CollisionCategory.FLOOR
        }
      }
    })
    this.setupAttackAnimMap()
  }

  setupGroundSensor() {
    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS
    const rectangle = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth * 0.7,
      this.sprite.displayHeight * 0.2
    ) as BodyType

    this.mainBody = Body.create({
      parts: [rectangle],
      render: {
        sprite: {
          xOffset: 0,
          yOffset: 0.4,
        },
      },
      restitution: 0,
      label: CollisionLabel.PLAYER,
    }) as BodyType
    this.mainBody.collisionFilter.category = CollisionCategory.PLAYER
    this.mainBody.collisionFilter.mask =
      CollisionCategory.FLOOR | CollisionCategory.BOUNDS

    this.sprite
      .setExistingBody(this.mainBody)
      .setScale(2)
      .setPosition(Player.SPAWN_POSITION.x, Player.SPAWN_POSITION.y)
      .setFixedRotation()
  }

  setupEnemySensor() {
    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS
    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth,
      this.sprite.displayHeight,
      {
        isSensor: true,
        label: CollisionLabel.PLAYER_ENEMY_SENSOR,
      }
    )
    const compoundBody = Body.create({
      parts: [mainBody],
    })
    this.enemyDetector = this.game.matter.add
      .sprite(0, 0, '')
      .setExistingBody(compoundBody as BodyType)
      .setVisible(false)
      .setFixedRotation()
      .setCollisionCategory(CollisionCategory.PLAYER_ENEMY_SENSOR)
      .setCollidesWith([CollisionCategory.ENEMY])
      .setSensor(true)
  }

  setupAttackAnimMap() {
    const horizontalSlash = new AttackSprite(this.game, {
      hitAnimKey: 'slash-horizontal-hit',
      attackAnimKey: 'slash-horizontal',
      hitboxScale: {
        width: 2,
        height: 0.75,
      },
      onComplete: () => {
        this.onAnimationComplete()
      },
    })

    const verticalSlash = new AttackSprite(this.game, {
      hitAnimKey: 'slash-vertical-hit',
      attackAnimKey: 'slash-vertical',
      hitboxScale: {
        width: 2,
        height: 0.75,
      },
      onComplete: () => {
        this.onAnimationComplete()
      },
    })

    const dashStrike = new AttackSprite(this.game, {
      hitAnimKey: 'slash-vertical-hit',
      attackAnimKey: 'dash-strike',
      hitboxScale: {
        width: 2,
        height: 0.75,
      },
      onComplete: () => {
        this.onAnimationComplete()
      },
    })

    this.attackAnimMap = {
      'slash-horizontal': horizontalSlash,
      'slash-vertical': verticalSlash,
      'dash-strike': dashStrike,
    }
  }

  onAnimationComplete() {
    if (this.animQueue.length == 0) {
      this.isAttacking = false
    } else {
      this.playNextAnimation()
    }
  }

  attack() {
    if (!this.isAttacking) {
      this.sprite.play('attack')
      this.isAttacking = true
      setTimeout(() => {
        this.animQueue = ['slash-horizontal', 'slash-vertical']
        this.playNextAnimation()
      }, 300)
    }
  }

  startCooldownEvent(
    cooldownTime: number,
    skillIcon: ActionIcon,
    onComplete: () => void
  ) {
    const refreshInterval = 125
    const cooldownEvent = this.game.time.addEvent({
      delay: refreshInterval,
      repeat: cooldownTime / refreshInterval,
      callback: () => {
        skillIcon.updateCooldownOverlay(1 - cooldownEvent.getOverallProgress())
        if (cooldownEvent.getOverallProgress() == 1) {
          onComplete()
        }
      },
    })
    skillIcon.updateCooldownOverlay(1 - cooldownEvent.getOverallProgress())
  }

  throwProjectile() {
    if (!this.projectileCooldown) {
      this.projectileCooldown = true
      new Projectile(this.game, {
        position: {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        flipX: this.sprite.flipX,
      })

      this.startCooldownEvent(
        Player.PROJECTILE_COOLDOWN_MS,
        UI.instance.throwingStarIcon,
        () => {
          this.projectileCooldown = false
        }
      )
    }
  }

  getDashEndX() {
    const sprite = this.sprite
    const dashDistance = sprite.flipX
      ? -Player.DASH_DISTANCE
      : Player.DASH_DISTANCE
    const endX = sprite.x + dashDistance
    const platformLayer = this.game.map.getLayer('Platforms')!

    // There's probably a more efficient way to check platform edges but I'm lazy and it works
    if (!sprite.flipX) {
      for (let x = sprite.x; x < endX; x++) {
        const tile = platformLayer.tilemapLayer.getTileAtWorldXY(x, sprite.y)
        if (tile) {
          return tile.getLeft()
        }
      }
    } else {
      for (let x = sprite.x; x > endX; x--) {
        const tile = platformLayer.tilemapLayer.getTileAtWorldXY(x, sprite.y)
        if (tile) {
          return tile.getRight()
        }
      }
    }
    return Math.min(
      Constants.GAME_WIDTH - this.sprite.displayWidth / 2,
      Math.max(0, endX)
    )
  }

  dash() {
    if (!this.dashOnCooldown && !this.isDead) {
      this.animQueue = ['dash-strike']
      this.playNextAnimation()
      this.sprite.setStatic(true)
      const sprite = this.sprite
      const endX = this.getDashEndX()

      const dashSpeed = 0.75
      const duration = Math.abs(sprite.x - endX) / dashSpeed
      this.dashOnCooldown = true
      this.game.tweens.add({
        targets: [sprite],
        onStart: () => {
          sprite.setTint(0x0000ff)
          this.isInvincible = true
          this.isDashing = true
        },
        onComplete: () => {
          sprite.clearTint()
          this.game.time.delayedCall(500, () => {
            this.isInvincible = false
          })
          this.isDashing = false
          this.sprite.setStatic(false)
        },
        x: {
          from: sprite.x,
          to: endX,
        },
        ease: Phaser.Math.Easing.Sine.InOut,
        duration: duration,
      })
      this.startCooldownEvent(
        Player.DASH_COOLDOWN_MS,
        UI.instance.dashIcon,
        () => {
          this.dashOnCooldown = false
        }
      )
    }
  }

  isGrounded() {
    const velocity = this.sprite.getVelocity()
    return Math.abs(velocity.y!) <= 0.0001
  }

  jump() {
    if (this.isDead) {
      return
    }
    if (this.isGrounded()) {
      this.sprite.setVelocityY(-Player.JUMP_VELOCITY)
      this.sprite.play('jump')
    } else {
      if (!this.doubleJumpOnCooldown) {
        this.doubleJumpOnCooldown = true
        this.sprite.setVelocityY(-Player.JUMP_VELOCITY)

        this.startCooldownEvent(
          Player.DOUBLE_JUMP_COOLDOWN_MS,
          UI.instance.jumpIcon,
          () => {
            this.doubleJumpOnCooldown = false
          }
        )
      }
    }
  }

  playNextAnimation() {
    const animKey = this.animQueue.shift() as string
    const attackSprite = this.attackAnimMap[animKey]
    const facingRight = this.sprite.flipX
    if (facingRight) {
      attackSprite.setFlipX(true)
      attackSprite.setPosition(
        this.sprite.x - (this.sprite.displayWidth / 2 + 25),
        this.sprite.y - 25
      )
    } else {
      attackSprite.setFlipX(false)
      attackSprite.setPosition(
        this.sprite.x + this.sprite.displayWidth / 2 + 25,
        this.sprite.y - 25
      )
    }
    attackSprite.setVisible(true)
    attackSprite.play()
  }

  takeDamage(damage: number) {
    if (!this.isInvincible) {
      this.isInvincible = true

      // Add a bit of player knockback
      this.sprite.setVelocity(-2, -2)

      UINumber.createNumber(
        `${damage}`,
        this.game,
        this.sprite.x,
        this.sprite.y - 20,
        true
      )

      UI.instance.decreasePlayerHealth(damage)

      if (UI.instance.healthbar.currValue == 0) {
        this.die()
      } else {
        // Add a flashing animation to indicate invincibilty window
        const flashingEvent = this.game.time.addEvent({
          delay: 100,
          callback: () => {
            if (this.sprite.isTinted) {
              this.sprite.clearTint()
            } else {
              this.sprite.setTint(0xaaaaaa)
            }
          },
          repeat: -1,
        })
        this.game.time.delayedCall(3000, () => {
          this.isInvincible = false
          this.sprite.clearTint()
          flashingEvent.destroy()
        })
      }
    }
  }

  die() {
    this.isDead = true
    this.sprite.setVelocity(0, 0)
    this.game.tweens.add({
      targets: [this.sprite],
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        UI.instance.gameOverModal.show()
      },
    })
  }
}
