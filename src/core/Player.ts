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

export class Player {
  private static SPAWN_POSITION = {
    x: 50,
    y: Constants.GAME_HEIGHT - 40,
  }
  private static SPEED = 5
  private static JUMP_VELOCITY = 12
  private static DASH_DISTANCE = 150
  public static DAMAGE = 5

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
    this.setupAttackSprite()
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

  setupAttackSprite() {
    const horizontalSlash = new AttackSprite(this.game, {
      hitAnimKey: 'slash-vertical-hit',
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

    this.attackAnimMap = {
      'slash-horizontal': horizontalSlash,
      'slash-vertical': verticalSlash,
    }

    console.log(this.attackAnimMap)
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
      this.isAttacking = true
      this.animQueue = [
        'slash-horizontal',
        'slash-vertical',
        'slash-horizontal',
        'slash-vertical',
      ]
      this.playNextAnimation()
    }
  }

  playNextAnimation() {
    const animKey = this.animQueue.shift() as string
    const attackSprite = this.attackAnimMap[animKey]
    const facingRight = this.sprite.flipX
    if (facingRight) {
      attackSprite.setFlipX(false)
      attackSprite.setPosition(
        this.sprite.x + this.sprite.displayWidth / 2 + 25,
        this.sprite.y - 25
      )
    } else {
      attackSprite.setFlipX(true)
      attackSprite.setPosition(
        this.sprite.x - (this.sprite.displayWidth / 2 + 25),
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
