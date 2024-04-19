import { BodyType } from 'matter'
import Game from '../scenes/Game'
import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../utils/Constants'
import { InputController } from './InputController'

export class Player {
  private static SPAWN_POSITION = {
    x: 50,
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

    // Bodies
    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS
    const enemyDetector = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth,
      this.sprite.displayHeight,
      {
        isSensor: true,
        label: CollisionLabel.PLAYER_ENEMY_SENSOR,
      }
    )
    enemyDetector.collisionFilter.group = CollisionCategory.PLAYER_ENEMY_SENSOR

    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )
    const compoundBody = Body.create({
      parts: [mainBody, enemyDetector],
    })

    // Setup body & sensors
    this.sprite
      .setExistingBody(compoundBody as BodyType)
      .setScale(2)
      .setFixedRotation()
      .setBounce(0)
      .setPosition(Player.SPAWN_POSITION.x, Player.SPAWN_POSITION.y)
      .setCollisionCategory(CollisionCategory.PLAYER)
      .setCollidesWith([CollisionCategory.FLOOR, CollisionCategory.BOUNDS])

    this.inputController = new InputController(this.game, {
      player: this,
      speed: Player.SPEED,
      jumpVelocity: Player.JUMP_VELOCITY,
      dashDistance: Player.DASH_DISTANCE,
    })
  }
}
