import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Player } from '../Player'
import { Projectile } from '../Projectile'
import StateMachine, { IState } from './StateMachine'

export default class ProjectileState implements IState {
  private static PROJECTILE_COOLDOWN_MS = 1000
  public name: string = 'ProjectileState'

  private player: Player
  private stateMachine: StateMachine

  constructor(player: Player, stateMachine: StateMachine) {
    this.player = player
    this.stateMachine = stateMachine
  }

  onEnter(): void {
    if (!this.player.projectileCooldown) {
      Game.instance.sound.play('throw', { volume: 0.5 })
      new Projectile(Game.instance, {
        position: {
          x: this.player.sprite.x,
          y: this.player.sprite.y,
        },
        flipX: this.player.sprite.flipX,
      })

      if (!this.player.isTurboCharged) {
        this.player.projectileCooldown = true
        Player.startCooldownEvent(
          ProjectileState.PROJECTILE_COOLDOWN_MS,
          UI.instance.throwingStarIcon,
          () => {
            this.player.projectileCooldown = false
          }
        )
      }
    }

    if (this.player.isGrounded()) {
      this.stateMachine.setState('IdleState')
    } else {
      this.stateMachine.setState('JumpState')
    }
  }

  onUpdate(_dt: number): void {}

  onExit(): void {}

  handleInput(_e: Phaser.Input.Keyboard.Key): void {}
}
