import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import SkillCooldown from '../../utils/SkillCooldown'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class JumpState implements IState {
  public name: string = 'JumpState'
  private MAX_FALL_VELOCITY = 9
  public static DOUBLE_JUMP_COOLDOWN_MS = 2000

  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  private player: Player
  private stateMachine: StateMachine

  private jumpBuffer: boolean = false // allow jump input before landing

  constructor(player: Player, stateMachine: StateMachine) {
    this.player = player
    this.stateMachine = stateMachine
    this.keyRight = Game.instance.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    )
    this.keyLeft = Game.instance.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    )
  }

  onEnter(): void {
    if (this.player.isGrounded()) {
      const jumpVelocity =
        Player.JUMP_VELOCITY *
        (this.player.isTurboCharged ? Player.TURBO_CHARGE_JUMP_MULTIPLIER : 1)
      this.player.sprite.setVelocityY(-jumpVelocity)
      Game.instance.sound.play('jump', { volume: 0.5 })
    }
  }

  onUpdate(dt: number): void {
    const vy = this.player.sprite.getVelocity().y ?? 0
    const sprite = this.player.sprite

    const jumpVelocity =
      Player.JUMP_VELOCITY *
      (this.player.isTurboCharged ? Player.TURBO_CHARGE_JUMP_MULTIPLIER : 1)

    const speed =
      Player.SPEED *
      (this.player.isTurboCharged ? Player.TURBO_CHARGE_SPEED_MULTIPLIER : 1)

    if (this.player.isGrounded() && vy >= 0) {
      if (this.jumpBuffer) {
        Game.instance.sound.play('jump', { volume: 0.5 })
        sprite.setVelocityY(-jumpVelocity)
        this.jumpBuffer = false
      } else if (sprite.getVelocity().x !== 0) {
        this.stateMachine.setState('MoveState')
      } else {
        this.stateMachine.setState('IdleState')
      }
    }
    if (vy < 0) {
      sprite.play('jump', true)
    } else if (vy > 0) {
      sprite.play('fall', true)
      sprite.setVelocityY(vy + 0.02 * dt)
    }
    // allow movement in the air
    if (this.keyLeft.isDown) {
      sprite.setFlipX(true)
      sprite.setVelocityX(-speed)
    } else if (this.keyRight.isDown) {
      sprite.setFlipX(false)
      sprite.setVelocityX(speed)
    } else {
      sprite.setVelocityX(0)
    }

    if (vy > this.MAX_FALL_VELOCITY) {
      sprite.setVelocityY(this.MAX_FALL_VELOCITY)
    }
  }

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {
    switch (e.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.SPACE: {
        if (!this.player.isGrounded() && !this.player.doubleJumpOnCooldown) {
          const jumpVelocity =
            Player.JUMP_VELOCITY *
            (this.player.isTurboCharged
              ? Player.TURBO_CHARGE_JUMP_MULTIPLIER
              : 1)
          Game.instance.sound.play('jump', { volume: 0.5 })
          this.player.sprite.setVelocityY(-jumpVelocity)

          if (!this.player.isTurboCharged) {
            this.player.doubleJumpOnCooldown = true
            Player.startCooldownEvent(
              JumpState.DOUBLE_JUMP_COOLDOWN_MS,
              UI.instance.jumpIcon,
              () => {
                this.player.doubleJumpOnCooldown = false
              }
            )
          }
        } else {
          this.jumpBuffer = true
          setTimeout(() => {
            this.jumpBuffer = false
          }, 100)
        }
        break
      }
      case Phaser.Input.Keyboard.KeyCodes.S: {
        if (this.player.dashOnCooldown) {
          this.stateMachine.setState('DashState')
        }
        break
      }
      case Phaser.Input.Keyboard.KeyCodes.F: {
        this.stateMachine.setState('AttackState')
        break
      }
      case Phaser.Input.Keyboard.KeyCodes.D: {
        this.stateMachine.setState('ProjectileState')
        break
      }
      default:
        return
    }
  }
}
