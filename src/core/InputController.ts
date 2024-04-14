import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { Player } from './Player'

export interface InputControllerConfig {
  player: Player
  speed: number
  jumpVelocity: number
  dashDistance: number
}

export class InputController {
  private game: Game
  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  // private sprite!: Phaser.Physics.Matter.Sprite
  private player: Player
  private speed: number
  private jumpVelocity: number
  private dashDistance: number
  private isDashing: boolean = false

  constructor(game: Game, config: InputControllerConfig) {
    this.game = game
    this.keyRight = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    )
    this.keyLeft = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    )
    this.player = config.player
    this.speed = config.speed
    this.jumpVelocity = config.jumpVelocity
    this.dashDistance = config.dashDistance

    this.game.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        switch (e.keyCode) {
          case Phaser.Input.Keyboard.KeyCodes.ALT: {
            this.player.sprite.setVelocityY(-this.jumpVelocity)
            break
          }
          case Phaser.Input.Keyboard.KeyCodes.Z: {
            this.dash()
            break
          }
          default:
            return
        }
      }
    )

    this.game.events.on('update', this.update, this)
  }

  // Take into account world bounds and platforms
  getDashEndX() {
    const sprite = this.player.sprite
    const dashDistance = sprite.flipX ? this.dashDistance : -this.dashDistance
    const endX = sprite.x + dashDistance
    const platformLayer = this.game.map.getLayer('Platforms')!

    // There's probably a more efficient way to check platform edges but I'm lazy and it works
    if (sprite.flipX) {
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
    return Math.min(Constants.GAME_WIDTH, Math.max(0, endX))
  }

  dash() {
    const sprite = this.player.sprite
    const endX = this.getDashEndX()
    const dashSpeed = 0.75
    const duration = Math.abs(sprite.x - endX) / dashSpeed

    this.game.tweens.add({
      targets: [sprite],
      onStart: () => {
        sprite.setTint(0x0000ff)
        this.isDashing = true
      },
      onComplete: () => {
        sprite.clearTint()
        this.isDashing = false
      },
      x: {
        from: sprite.x,
        to: endX,
      },
      ease: Phaser.Math.Easing.Sine.InOut,
      duration: duration,
    })
  }

  update() {
    if (!this.isDashing) {
      const sprite = this.player.sprite
      if (this.keyLeft.isDown) {
        sprite.setFlipX(false)
        sprite.setVelocityX(-this.speed)
      } else if (this.keyRight.isDown) {
        sprite.setFlipX(true)
        sprite.setVelocityX(this.speed)
      }
    }
  }
}
