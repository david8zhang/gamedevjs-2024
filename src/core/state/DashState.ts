import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'
import { Player } from '../Player'
import StateMachine, { IState } from './StateMachine'

export default class DashState implements IState {
  private static DASH_COOLDOWN_MS = 4000
  private static DASH_DISTANCE = 150

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
    const endX = this.getDashEndX()
    const dashSpeed = 0.75
    const duration = Math.abs(sprite.x - endX) / dashSpeed
    sprite.play('dash')

    this.player.dashOnCooldown = true
    Game.instance.tweens.add({
      targets: [sprite],
      onStart: () => {
        sprite.setTint(0x0000ff)
        this.player.isInvincible = true
      },
      onComplete: () => {
        sprite.clearTint()
        Game.instance.time.delayedCall(500, () => {
          this.player.isInvincible = false
        })
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
    Player.startCooldownEvent(
      DashState.DASH_COOLDOWN_MS,
      UI.instance.dashIcon,
      () => {
        this.player.dashOnCooldown = false
      }
    )
  }

  onUpdate(_dt: number): void {}

  onExit(): void {}

  handleInput(_e: Phaser.Input.Keyboard.Key): void {}

  private getDashEndX() {
    const sprite = this.player.sprite
    const dashDistance = sprite.flipX
      ? -DashState.DASH_DISTANCE
      : DashState.DASH_DISTANCE
    const endX = sprite.x + dashDistance
    const platformLayer = Game.instance.map.getLayer('Platforms')!

    // There's probably a more efficient way to check platform edges but I'm lazy and it works
    if (!sprite.flipX) {
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
      Constants.GAME_WIDTH - this.player.sprite.displayWidth / 2,
      Math.max(0, endX)
    )
  }
}
