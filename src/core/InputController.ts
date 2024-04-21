import Game from '../scenes/Game'
import { UI } from '../scenes/UI'
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
  private player: Player
  private speed: number
  private jumpVelocity: number

  // Dashing
  private dashDistance: number
  private isDashing: boolean = false
  private dashOnCooldown: boolean = false
  private doubleJumpOnCooldown: boolean = false

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
          case Phaser.Input.Keyboard.KeyCodes.SPACE: {
            this.jump()
            break
          }
          case Phaser.Input.Keyboard.KeyCodes.S: {
            this.dash()
            break
          }
          case Phaser.Input.Keyboard.KeyCodes.F: {
            this.player.attack()
          }
          default:
            return
        }
      }
    )

    this.game.events.on('update', this.update, this)
  }

  isGrounded() {
    const velocity = this.player.sprite.getVelocity()
    return Math.abs(velocity.y!) <= 0.0001
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
    return Math.min(
      Constants.GAME_WIDTH - this.player.sprite.displayWidth / 2,
      Math.max(0, endX)
    )
  }

  jump() {
    if (this.player.isDead) {
      return
    }
    if (this.isGrounded()) {
      this.player.sprite.setVelocityY(-this.jumpVelocity)
    } else {
      if (!this.doubleJumpOnCooldown) {
        this.doubleJumpOnCooldown = true
        this.player.sprite.setVelocityY(-this.jumpVelocity)
        const cooldownEvent = this.game.time.addEvent({
          delay: 125,
          repeat: 16,
          callback: () => {
            if (UI.instance.jumpIcon) {
              UI.instance.jumpIcon.updateCooldownOverlay(
                1 - cooldownEvent.getOverallProgress()
              )
            }
            if (cooldownEvent.getOverallProgress() == 1) {
              this.doubleJumpOnCooldown = false
            }
          },
        })
        if (UI.instance.jumpIcon) {
          UI.instance.jumpIcon.updateCooldownOverlay(
            1 - cooldownEvent.getOverallProgress()
          )
        }
      }
    }
  }

  dash() {
    if (!this.dashOnCooldown && !this.player.isDead) {
      const sprite = this.player.sprite
      const endX = this.getDashEndX()

      const dashSpeed = 0.75
      const duration = Math.abs(sprite.x - endX) / dashSpeed
      this.dashOnCooldown = true
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

      const cooldownEvent = this.game.time.addEvent({
        delay: 125,
        repeat: 32,
        callback: () => {
          UI.instance.dashIcon.updateCooldownOverlay(
            1 - cooldownEvent.getOverallProgress()
          )
          if (cooldownEvent.getOverallProgress() == 1) {
            this.dashOnCooldown = false
          }
        },
      })
      UI.instance.dashIcon.updateCooldownOverlay(
        1 - cooldownEvent.getOverallProgress()
      )
    }
  }

  update() {
    if (!this.isDashing && !this.player.isDead) {
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
