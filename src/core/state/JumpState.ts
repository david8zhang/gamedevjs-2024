import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class JumpState implements IState {
  public name: string = 'JumpState'

  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  private player: Player
  private stateMachine: StateMachine

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
    console.log(this.player.isGrounded())
    if (this.player.isGrounded()) {
      this.player.sprite.setVelocityY(-Player.JUMP_VELOCITY)
      this.player.sprite.play('jump')
    }
  }

  onUpdate(_dt: number): void {
    const vy = this.player.sprite.getVelocity().y
    if (this.player.isGrounded() && vy != null && vy >= 0) {
      if (this.player.sprite.getVelocity().x !== 0) {
        this.stateMachine.setState('MoveState')
      } else {
        this.stateMachine.setState('IdleState')
      }
    }
    // allow movement in the air
    const sprite = this.player.sprite
    if (this.keyLeft.isDown) {
      sprite.setFlipX(true)
      sprite.setVelocityX(-Player.SPEED)
    } else if (this.keyRight.isDown) {
      sprite.setFlipX(false)
      sprite.setVelocityX(Player.SPEED)
    }
  }

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {
    switch (e.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.SPACE: {
        if (!this.player.isGrounded() && !this.player.doubleJumpOnCooldown) {
          this.player.doubleJumpOnCooldown = true
          this.player.sprite.setVelocityY(-Player.JUMP_VELOCITY)
          Player.startCooldownEvent(
            Player.DOUBLE_JUMP_COOLDOWN_MS,
            UI.instance.jumpIcon,
            () => {
              this.player.doubleJumpOnCooldown = false
            }
          )
        }
        break
      }
      case Phaser.Input.Keyboard.KeyCodes.S: {
        if (!this.player.dashOnCooldown) {
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
