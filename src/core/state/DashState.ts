import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class DashState implements IState {
  public name: string = 'DashState'

  private player: Player
  private stateMachine: StateMachine

  constructor(player: Player, stateMachine: StateMachine) {
    this.player = player
    this.stateMachine = stateMachine
  }

  onEnter(): void {
    this.player.animQueue = ['dash-strike']
    this.player.playNextAnimation()
    this.player.sprite.setStatic(true)
    const sprite = this.player.sprite
    const endX = this.player.getDashEndX()

    const dashSpeed = 0.75
    const duration = Math.abs(sprite.x - endX) / dashSpeed
    this.player.dashOnCooldown = true
    Game.instance.tweens.add({
      targets: [sprite],
      onStart: () => {
        sprite.setTint(0x0000ff)
        this.player.isInvincible = true
        this.player.isDashing = true
      },
      onComplete: () => {
        sprite.clearTint()
        Game.instance.time.delayedCall(500, () => {
          this.player.isInvincible = false
        })
        this.player.isDashing = false
        this.player.sprite.setStatic(false)
        if (this.player.isGrounded()) {
          this.stateMachine.setState('IdleState')
        } else {
          this.stateMachine.setState('JumpState')
        }
      },
      x: {
        from: sprite.x,
        to: endX,
      },
      ease: Phaser.Math.Easing.Sine.InOut,
      duration: duration,
    })
    this.player.startCooldownEvent(
      Player.DASH_COOLDOWN_MS,
      UI.instance.dashIcon,
      () => {
        this.player.dashOnCooldown = false
      }
    )
  }

  onUpdate(dt: number): void {}

  onExit(): void {}

  handleInput(e: Phaser.Input.Keyboard.Key): void {}
}
