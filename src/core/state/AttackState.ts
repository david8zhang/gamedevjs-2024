import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class AttackState implements IState {
  public name: string = 'AttackState'

  private player: Player
  private stateMachine: StateMachine

  constructor(player: Player, stateMachine: StateMachine) {
    this.player = player
    this.stateMachine = stateMachine
  }

  onEnter(): void {
    this.player.sprite.play('attack')
    this.player.isAttacking = true
    setTimeout(() => {
      this.player.animQueue = ['slash-horizontal', 'slash-vertical']
      this.player.playNextAnimation()
    }, 300)

    if (this.player.isGrounded()) {
      this.stateMachine.setState('IdleState')
    } else {
      this.stateMachine.setState('JumpState')
    }
  }

  onUpdate(_dt: number): void {}

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {}
}
