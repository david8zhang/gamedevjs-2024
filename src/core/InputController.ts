import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'

export interface InputControllerConfig {
  sprite: Phaser.Physics.Matter.Sprite
  speed: number
  jumpVelocity: number
  dashDistance: number
}

export class InputController {
  private game: Game
  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  private sprite!: Phaser.Physics.Matter.Sprite
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
    this.sprite = config.sprite
    this.speed = config.speed
    this.jumpVelocity = config.jumpVelocity
    this.dashDistance = config.dashDistance

    this.game.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        switch (e.keyCode) {
          case Phaser.Input.Keyboard.KeyCodes.ALT: {
            this.sprite.setVelocityY(-this.jumpVelocity)
            break
          }
          case Phaser.Input.Keyboard.KeyCodes.Z: {
            this.groundDash()
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
    const dashDistance = this.sprite.flipX
      ? this.dashDistance
      : -this.dashDistance
    const endX = this.sprite.x + dashDistance
    const platformLayer = this.game.map.getLayer('Platforms')!

    // There's probably a more efficient way to check platform edges but I'm lazy and it works
    if (this.sprite.flipX) {
      for (let x = this.sprite.x; x < endX; x++) {
        const tile = platformLayer.tilemapLayer.getTileAtWorldXY(
          x,
          this.sprite.y
        )
        if (tile) {
          return tile.getLeft()
        }
      }
    } else {
      for (let x = this.sprite.x; x > endX; x--) {
        const tile = platformLayer.tilemapLayer.getTileAtWorldXY(
          x,
          this.sprite.y
        )
        if (tile) {
          return tile.getRight()
        }
      }
    }
    return Math.min(Constants.GAME_WIDTH, Math.max(0, endX))
  }

  groundDash() {
    const endX = this.getDashEndX()
    const dashSpeed = 1
    const duration = Math.abs(this.sprite.x - endX) / dashSpeed

    this.game.tweens.add({
      targets: [this.sprite],
      onStart: () => {
        this.isDashing = true
      },
      onComplete: () => {
        this.isDashing = false
      },
      x: {
        from: this.sprite.x,
        to: endX,
      },
      ease: Phaser.Math.Easing.Sine.InOut,
      duration: duration,
    })
  }

  update() {
    if (!this.isDashing) {
      if (this.keyLeft.isDown) {
        this.sprite.setFlipX(false)
        this.sprite.setVelocityX(-this.speed)
      } else if (this.keyRight.isDown) {
        this.sprite.setFlipX(true)
        this.sprite.setVelocityX(this.speed)
      }
    }
  }
}
