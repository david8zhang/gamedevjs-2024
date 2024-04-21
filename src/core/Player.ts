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
import { Monster } from './Monster'

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
  public attackSprite!: Phaser.Physics.Matter.Sprite
  public hitSprite!: Phaser.GameObjects.Sprite
  public isInvincible: boolean = false

  public isAttacking: boolean = false
  public attackHitboxActive: boolean = false
  public processedDamageMonsterIds: Set<String> = new Set()
  public isDead: boolean = false

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
    this.attackSprite = this.game.matter.add.sprite(
      this.sprite.x,
      this.sprite.y,
      ''
    )

    this.hitSprite = this.game.add
      .sprite(this.sprite.x, this.sprite.y, '')
      .setVisible(false)
      .setScale(2)
      .setDepth(1000)

    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS
    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth,
      this.sprite.displayHeight * 0.6,
      {
        isSensor: true,
      }
    )
    const compoundBody = Body.create({
      parts: [mainBody],
      label: CollisionLabel.ATTACK_HITBOX,
    }) as BodyType

    compoundBody.collisionFilter.category = CollisionCategory.ATTACK_HITBOX
    compoundBody.collisionFilter.mask = CollisionCategory.ENEMY

    this.attackSprite
      .setExistingBody(compoundBody as BodyType)
      .setVisible(false)
      .setStatic(true)
      .setFixedRotation()
      .setScale(3)
      .setSensor(true)
      .setDepth(1000)
      .on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isAttacking = false
        this.processedDamageMonsterIds.clear()
      })
      .on(Phaser.Animations.Events.ANIMATION_UPDATE, (_: any, frame: any) => {
        if (frame.index <= 3) {
          this.attackHitboxActive = true
        } else {
          this.attackHitboxActive = false
        }
      })

    mainBody.onCollideActiveCallback = (e: any) => {
      const { bodyA, bodyB } = e
      if (
        bodyA.label === CollisionLabel.ENEMY ||
        bodyB.label === CollisionLabel.ENEMY
      ) {
        if (this.attackHitboxActive) {
          const enemyBody: BodyType =
            bodyA.label === CollisionLabel.ENEMY ? bodyA : bodyB
          const enemyGameObject = enemyBody.gameObject
          if (enemyGameObject) {
            const enemyRef = enemyGameObject.getData('ref') as Monster

            if (
              !this.processedDamageMonsterIds.has(enemyRef.id) &&
              !enemyRef.isDead &&
              enemyRef.isHitboxActive
            ) {
              this.processedDamageMonsterIds.add(enemyRef.id)
              // Add a bit of knockback
              enemyRef.sprite.setVelocity(
                this.attackSprite.flipX ? -2 : 2,
                -2.5
              )

              // Play the hit sprite
              this.hitSprite.setPosition(enemyRef.sprite.x, enemyRef.sprite.y)
              this.hitSprite
                .setVisible(true)
                .play('slash-hit')
                .setFlipX(this.attackSprite.flipX)
              enemyRef.takeDamage(Player.DAMAGE)
            }
          }
        }
      }
    }
  }

  attack() {
    if (!this.isAttacking) {
      this.isAttacking = true
      const facingRight = this.sprite.flipX
      this.attackSprite.setVisible(true)
      this.attackSprite.play('slash1')
      if (facingRight) {
        this.attackSprite.setFlipX(false)
        this.attackSprite.setPosition(
          this.sprite.x + this.sprite.displayWidth / 2 + 25,
          this.sprite.y
        )
      } else {
        this.attackSprite.setFlipX(true)
        this.attackSprite.setPosition(
          this.sprite.x - (this.sprite.displayWidth / 2 + 25),
          this.sprite.y
        )
      }
    }
  }

  takeDamage(damage: number) {
    if (!this.isInvincible) {
      this.isInvincible = true

      // Add a bit of player knockback
      this.sprite.setVelocity(-5, -5)

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
