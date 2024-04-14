import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { InputController } from './InputController'

export class Player {
  private static SPAWN_POSITION = {
    x: 10,
    y: Constants.GAME_HEIGHT - 40,
  }
  private static SPEED = 5
  private static JUMP_VELOCITY = 9
  private static DASH_DISTANCE = 150

  private game: Game
  public sprite: Phaser.Physics.Matter.Sprite

  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.matter.add
      .sprite(Player.SPAWN_POSITION.x, Player.SPAWN_POSITION.y, 'player')
      .setFixedRotation()
      .setFrictionAir(0.02)
      .setFrictionStatic(0)
      .setFriction(0.1)
    new InputController(this.game, {
      sprite: this.sprite,
      speed: Player.SPEED,
      jumpVelocity: Player.JUMP_VELOCITY,
      dashDistance: Player.DASH_DISTANCE,
    })
  }
}
