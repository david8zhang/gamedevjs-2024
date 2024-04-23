import { BodyType } from 'matter'
import Game from '../scenes/Game'
import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../utils/Constants'
// import { InputController } from './InputController'
import { UI } from '../scenes/UI'
import { UINumber } from './ui/UINumber'
import { AttackSprite } from './AttackSprite'
import { Monster } from './Monster'
import StateMachine from '../utils/StateMachine'

export class Player {
  private static SPAWN_POSITION = {
    x: 50,
    y: Constants.GAME_HEIGHT - 40,
  }
  private static JUMP_VELOCITY = 10
  private static DASH_DISTANCE = 150
  public static SPEED = 3
  public static DAMAGE = 5

  private game: Game

  public sprite: Phaser.Physics.Matter.Sprite
  public mainBody!: BodyType
  public enemyDetector!: Phaser.Physics.Matter.Sprite
  // public inputController!: InputController
  public attackAnimMap: { [key: string]: AttackSprite } = {}
  public isInvincible: boolean = false
  public isAttacking: boolean = false
  public isDead: boolean = false
  public animQueue: string[] = []
  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key

  // Dash
  public isDashing: boolean = false
  public dashOnCooldown: boolean = false

  // Jump
  public doubleJumpOnCooldown: boolean = false

  private stateMachine!: StateMachine
  private xp: number = 0

  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'player')

    // Setup body & sensors
    this.setupGroundSensor()
    this.setupEnemySensor()

    // this.inputController = new InputController(this.game, {
    //   player: this,
    //   speed: Player.SPEED,
    //   jumpVelocity: Player.JUMP_VELOCITY,
    //   dashDistance: Player.DASH_DISTANCE,
    // })
    this.keyRight = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    )
    this.keyLeft = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    )

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
    Monster.onMonsterDied.push(() => {
      console.log('Monster died')
      this.xp += 10
    })

    this.setupStateMachine()
  }

  setupStateMachine() {
    this.stateMachine = new StateMachine(this)
    this.stateMachine
      .addState({
        name: 'grounded',
        onUpdate: () => {
          const sprite = this.sprite
          if (this.keyLeft.isDown) {
            sprite.setFlipX(false)
            sprite.setVelocityX(-Player.SPEED)
          } else if (this.keyRight.isDown) {
            sprite.setFlipX(true)
            sprite.setVelocityX(Player.SPEED)
          } else {
            sprite.setVelocityX(0)
          }
        },
        handleInput: (e: Phaser.Input.Keyboard.Key) => {
          switch (e.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.SPACE: {
              this.stateMachine.setState('jump')
              break
            }
            case Phaser.Input.Keyboard.KeyCodes.S: {
              this.stateMachine.setState('dash')
              break
            }
            case Phaser.Input.Keyboard.KeyCodes.F: {
              this.stateMachine.setState('attack')
              break
            }
          }
        },
      })
      .addState({
        name: 'jump',
        onEnter: this.jumpOnEnter,
        onUpdate: () => {
          const sprite = this.sprite
          if (this.keyLeft.isDown) {
            sprite.setFlipX(false)
            sprite.setVelocityX(-Player.SPEED)
          } else if (this.keyRight.isDown) {
            sprite.setFlipX(true)
            sprite.setVelocityX(Player.SPEED)
          } else {
            sprite.setVelocityX(0)
          }
          if (this.isGrounded()) {
            this.stateMachine.setState('grounded')
          }
        },
        handleInput: (e: Phaser.Input.Keyboard.Key) => {
          switch (e.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.SPACE:
              {
                if (!this.doubleJumpOnCooldown) {
                  this.jumpOnEnter()
                }
              }
              break
            case Phaser.Input.Keyboard.KeyCodes.S: {
              this.stateMachine.setState('dash')
              break
            }
            case Phaser.Input.Keyboard.KeyCodes.F: {
              this.stateMachine.setState('attack')
              break
            }
          }
        },
      })
      .addState({
        name: 'dash',
        onEnter: this.dash,
        onExit: () => {
          this.sprite.setStatic(false)
        },
      })
      .addState({
        name: 'attack',
        onEnter: this.attack,
        handleInput: (e: Phaser.Input.Keyboard.Key) => {
          switch (e.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.SPACE: {
              this.stateMachine.setState('jump')
              break
            }
            case Phaser.Input.Keyboard.KeyCodes.S: {
              this.stateMachine.setState('dash')
              break
            }
            case Phaser.Input.Keyboard.KeyCodes.F: {
              this.stateMachine.setState('attack')
              break
            }
          }
        },
      })
    this.game.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        this.stateMachine.handleInput(e)
      }
    )
    this.stateMachine.setState('grounded')
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

    this.attackAnimMap = {
      'slash-horizontal': horizontalSlash,
      'slash-vertical': verticalSlash,
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
    this.isAttacking = true
    this.animQueue = ['slash-horizontal', 'slash-vertical']
    this.playNextAnimation()
  }

  getDashEndX() {
    const sprite = this.sprite
    const dashDistance = sprite.flipX
      ? Player.DASH_DISTANCE
      : -Player.DASH_DISTANCE
    const endX = sprite.x + dashDistance
    const platformLayer = this.game.map.getLayer('Platforms')!

    // There's probably a more efficient way to check platform edges but I'm lazy and it works
    if (sprite.flipX) {
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
        this.isDashing = true
      },
      onComplete: () => {
        sprite.clearTint()
        this.isDashing = false
        if (this.isGrounded()) {
          this.stateMachine.setState('grounded')
        } else {
          this.stateMachine.setState('jump')
        }
      },
      x: {
        from: sprite.x,
        to: endX,
      },
      ease: Phaser.Math.Easing.Sine.InOut,
      duration: duration,
    })

    const cooldownEvent = this.game.time.addEvent({
      delay: 125,
      repeat: 32,
      callback: () => {
        UI.instance.dashIcon.updateCooldownOverlay(
          1 - cooldownEvent.getOverallProgress()
        )
        if (cooldownEvent.getOverallProgress() == 1) {
          this.dashOnCooldown = false
        }
      },
    })
    UI.instance.dashIcon.updateCooldownOverlay(
      1 - cooldownEvent.getOverallProgress()
    )
  }

  isGrounded() {
    const velocity = this.sprite.getVelocity()
    return Math.abs(velocity.y!) <= 0.0001
  }

  jumpOnEnter() {
    // if (this.isDead) {
    //   return
    // }
    if (this.isGrounded()) {
      this.sprite.setVelocityY(-Player.JUMP_VELOCITY)
    } else {
      if (!this.doubleJumpOnCooldown) {
        this.doubleJumpOnCooldown = true
        this.sprite.setVelocityY(-Player.JUMP_VELOCITY)
        const cooldownEvent = this.game.time.addEvent({
          delay: 125,
          repeat: 16,
          callback: () => {
            if (UI.instance.jumpIcon) {
              UI.instance.jumpIcon.updateCooldownOverlay(
                1 - cooldownEvent.getOverallProgress()
              )
            }
            if (cooldownEvent.getOverallProgress() == 1) {
              this.doubleJumpOnCooldown = false
            }
          },
        })
        if (UI.instance.jumpIcon) {
          UI.instance.jumpIcon.updateCooldownOverlay(
            1 - cooldownEvent.getOverallProgress()
          )
        }
      }
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

  update(_t: number, dt: number) {
    this.stateMachine.update(dt)
  }
}
