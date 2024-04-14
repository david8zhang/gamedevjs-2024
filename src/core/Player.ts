import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { InputController } from './InputController'

export class Player {
  private static SPAWN_POSITION = {
    x: 10,
    y: Constants.GAME_HEIGHT - 40,
  }
  private static SPEED = 5
  private static JUMP_VELOCITY = 12
  private static DASH_DISTANCE = 150

  private game: Game
  public sprite: Phaser.Physics.Matter.Sprite
  public inputController!: InputController

  constructor(game: Game) {
    this.game = game

    this.sprite = this.game.matter.add.sprite(0, 0, 'player')

    // Setup body & sensors
    this.sprite
      .setScale(2)
      .setFixedRotation()
      .setBounce(0)
      .setPosition(Player.SPAWN_POSITION.x, Player.SPAWN_POSITION.y)

    this.inputController = new InputController(this.game, {
      player: this,
      speed: Player.SPEED,
      jumpVelocity: Player.JUMP_VELOCITY,
      dashDistance: Player.DASH_DISTANCE,
    })
  }
}
