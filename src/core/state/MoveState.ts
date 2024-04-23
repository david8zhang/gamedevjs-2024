import Game from '../../scenes/Game'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class MoveState implements IState {
  public name: string = 'MoveState'

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
    this.player.sprite.setFrame(0)
  }

  onUpdate(dt: number): void {
    const sprite = this.player.sprite
    if (this.keyLeft.isDown) {
      sprite.play('run', true)
      sprite.setFlipX(true)
      sprite.setVelocityX(-Player.SPEED)
    } else if (this.keyRight.isDown) {
      sprite.play('run', true)
      sprite.setFlipX(false)
      sprite.setVelocityX(Player.SPEED)
    } else {
      sprite.setVelocityX(0)
      this.stateMachine.setState('IdleState')
    }
  }

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {
    switch (e.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.SPACE: {
        this.stateMachine.setState('JumpState')
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
