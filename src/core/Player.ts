import { BodyType } from 'matter'
import Game from '../scenes/Game'
import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../utils/Constants'
import { UI } from '../scenes/UI'
import { UINumber } from './ui/UINumber'
import { AttackSprite } from './AttackSprite'
import StateMachine from './state/StateMachine'
import IdleState from './state/IdleState'
import MoveState from './state/MoveState'
import JumpState from './state/JumpState'
import DashState from './state/DashState'
import AttackState from './state/AttackState'
import ProjectileState from './state/ProjectileState'
import SkillCooldown from '../utils/SkillCooldown'
import { ActionIcon } from './ui/ActionIcon'

export class Player {
  private static SPAWN_POSITION = {
    x: 50,
    y: Constants.GAME_HEIGHT - 100,
  }
  private static ANIM_KEY_TO_SFX: { [key: string]: string } = {
    'slash-vertical': 'slash',
    'slash-horizontal': 'slash',
    'dash-strike': 'dash',
  }
  private static PROJECTILE_COOLDOWN_MS = 1000
  private static DOUBLE_JUMP_COOLDOWN_MS = 2000
  private static DASH_COOLDOWN_MS = 4000

  public static JUMP_VELOCITY = 10
  public static SPEED = 3
  public static DAMAGE = 5
  public static PROJECTILE_DAMAGE = 5

  // Turbo charge
  public static TURBOCHARGE_COMBO_THRESHOLD = 50
  public static TURBOCHARGE_DURATION_MS = 10000
  public static TURBO_CHARGE_SPEED_MULTIPLIER = 2
  public static TURBO_CHARGE_JUMP_MULTIPLIER = 1.5
  public static TURBO_CHARGE_DMG_MULTIPLIER = 2
  public static COMBO_EXPIRATION_TIME_MS = 15000

  private game: Game
  public sprite: Phaser.Physics.Matter.Sprite
  public mainBody!: BodyType
  public enemyDetector!: Phaser.Physics.Matter.Sprite
  public attackAnimMap: { [key: string]: AttackSprite } = {}
  public isInvincible: boolean = false
  public isAttacking: boolean = false
  public isDead: boolean = false
  public animQueue: string[] = []

  // Cooldowns
  public doubleJumpOnCooldown: boolean = false
  public dashOnCooldown: boolean = false
  public projectileCooldown: boolean = false
  public isTurboCharged: boolean = false

  public doubleJumpSkillCooldown: SkillCooldown
  public dashSkillCooldown: SkillCooldown
  public projectileSkillCooldown: SkillCooldown

  public combo: number = 0
  public comboExpirationEvent!: Phaser.Time.TimerEvent
  private stateMachine: StateMachine

  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'player')

    // Setup body & sensors
    this.setupGroundSensor()
    this.setupEnemySensor()

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

    this.doubleJumpSkillCooldown = new SkillCooldown(
      Player.DOUBLE_JUMP_COOLDOWN_MS,
      'jumpIcon'
    )
    this.dashSkillCooldown = new SkillCooldown(
      Player.DASH_COOLDOWN_MS,
      'dashIcon'
    )
    this.projectileSkillCooldown = new SkillCooldown(
      Player.PROJECTILE_COOLDOWN_MS,
      'throwingStarIcon'
    )

    // Setup state machine
    this.stateMachine = new StateMachine()
    this.stateMachine.addState(new IdleState(this, this.stateMachine))
    this.stateMachine.addState(new MoveState(this, this.stateMachine))
    this.stateMachine.addState(new JumpState(this, this.stateMachine))
    this.stateMachine.addState(new DashState(this, this.stateMachine))
    this.stateMachine.addState(new AttackState(this, this.stateMachine))
    this.stateMachine.addState(new ProjectileState(this, this.stateMachine))
    this.game.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        this.stateMachine.handleInput(e)
      }
    )
    this.stateMachine.setState('IdleState')
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
      .setScale(4)
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

  incrementCombo() {
    this.combo++
    // Begin tubocharge
    if (this.combo === Player.TURBOCHARGE_COMBO_THRESHOLD) {
      this.combo = 0
      this.game.sound.stopByKey('bgm')
      this.game.sound.play('turbo', { volume: 0.3 })
      UI.instance.comboText.displayTurbocharged()
      this.isTurboCharged = true
      if (this.comboExpirationEvent) {
        this.comboExpirationEvent.destroy()
      }
      this.game.time.delayedCall(Player.TURBOCHARGE_DURATION_MS, () => {
        this.isTurboCharged = false
        UI.instance.comboText.endTurbocharge()
        this.game.sound.stopByKey('turbo')
        this.game.sound.play('bgm', { volume: 0.25 })
      })
      const turboChargeMeterEvent = this.game.time.addEvent({
        delay: 125,
        repeat: Player.TURBOCHARGE_DURATION_MS / 125,
        callback: () => {
          const progress = 1 - turboChargeMeterEvent.getOverallProgress()
          UI.instance.comboText.decreaseTurboChargeMeter(progress)
        },
      })
    } else {
      UI.instance.comboText.displayCombo(this.combo)
      if (this.comboExpirationEvent) {
        this.comboExpirationEvent.destroy()
      }
      this.comboExpirationEvent = this.game.time.addEvent({
        delay: 125,
        repeat: Player.COMBO_EXPIRATION_TIME_MS / 125,
        callback: () => {
          const opacity = 1 - this.comboExpirationEvent.getOverallProgress()
          UI.instance.comboText.fadeDown(opacity)
          if (this.comboExpirationEvent.getOverallProgress() == 1) {
            this.combo = 0
            UI.instance.comboText.displayCombo(this.combo)
          }
        },
      })
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

  static startCooldownEvent(
    cooldownTime: number,
    skillIcon: ActionIcon,
    onComplete: () => void
  ) {
    const refreshInterval = 125
    const cooldownEvent = Game.instance.time.addEvent({
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

  isGrounded() {
    const floorBodies = this.game.matter.world
      .getAllBodies()
      .filter((b) => b.label === CollisionLabel.FLOOR)
    const collisionData = this.game.matter.intersectBody(
      this.mainBody,
      floorBodies
    )
    return collisionData.length > 0
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
    this.game.sound.play(Player.ANIM_KEY_TO_SFX[animKey], { volume: 0.5 })
  }

  restoreHealth(hpAmount: number) {
    UI.instance.increasePlayerHealth(hpAmount)
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
        true,
        false
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
    if (!this.isDead) {
      this.stateMachine.update(dt)
    }
    this.dashSkillCooldown.update(dt)
    this.doubleJumpSkillCooldown.update(dt)
    this.projectileSkillCooldown.update(dt)
  }
}
