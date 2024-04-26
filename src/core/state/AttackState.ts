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
    this.player.sprite.play('attack2')
    this.player.isAttacking = true
    setTimeout(() => {
      this.player.animQueue = ['slash-horizontal', 'slash-vertical']
      this.player.playNextAnimation()
    }, 100)
  }

  onUpdate(_dt: number): void {
    if (this.player.isAttacking === false) {
      if (this.player.isGrounded()) {
        this.stateMachine.setState('IdleState')
      } else {
        this.stateMachine.setState('JumpState')
      }
    }
  }

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {
    switch (e.keyCode) {
      // Can cancel attack into dash
      case Phaser.Input.Keyboard.KeyCodes.S: {
        if (
          this.player.dashSkillCooldown.usesLeft > 0 ||
          this.player.isTurboCharged
        ) {
          this.stateMachine.setState('DashState')
        }
        break
      }
    }
  }
}
