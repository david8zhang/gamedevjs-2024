import Game from '../scenes/Game'

export interface InputControllerConfig {
  sprite: Phaser.Physics.Matter.Sprite
  speed: number
}

export class InputController {
  private game: Game
  private keyRight!: Phaser.Input.Keyboard.Key
  private keyLeft!: Phaser.Input.Keyboard.Key
  private sprite!: Phaser.Physics.Matter.Sprite
  private speed: number

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

    this.game.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        switch (e.keyCode) {
          case Phaser.Input.Keyboard.KeyCodes.SPACE: {
            this.sprite.setVelocityY(-9)
            break
          }
          default:
            return
        }
      }
    )

    this.game.events.on('update', this.update, this)
  }

  update() {
    if (this.keyLeft.isDown) {
      this.sprite.setFlipX(false)
      this.sprite.setVelocityX(-this.speed)
    } else if (this.keyRight.isDown) {
      this.sprite.setFlipX(true)
      this.sprite.setVelocityX(this.speed)
    }
  }
}
