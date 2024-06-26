import Game from '../../scenes/Game'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class IdleState implements IState {
  public name: string = 'IdleState'

  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  private player: Player
  private stateMachine: StateMachine

  constructor(player: Player, stateMachine: StateMachine) {
    this.player = player
    this.stateMachine = stateMachine
    if (Game.instance && Game.instance.input) {
      this.keyRight = Game.instance.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.RIGHT
      )
      this.keyLeft = Game.instance.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.LEFT
      )
    }
  }

  onEnter(): void {
    this.player.sprite.stop()
    this.player.sprite.setFrame(0)
  }

  onUpdate(): void {
    this.player.sprite.setVelocityX(0)
    if (this.keyLeft.isDown || this.keyRight.isDown) {
      this.stateMachine.setState('MoveState')
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
        this.stateMachine.setState('DashState')
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
      case Phaser.Input.Keyboard.KeyCodes.LEFT:
      case Phaser.Input.Keyboard.KeyCodes.RIGHT: {
        this.stateMachine.setState('MoveState')
        break
      }
      default:
        return
    }
  }
}
