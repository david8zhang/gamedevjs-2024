import Game from '../scenes/Game'
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
  }
}
