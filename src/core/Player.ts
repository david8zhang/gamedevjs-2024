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
  public enemyDetector: Phaser.Physics.Matter.Sprite
  public inputController!: InputController

  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, 'player')

    // Bodies
    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS

    // Setup body & sensors
    this.sprite
      .setScale(2)
      .setFixedRotation()
      .setBounce(0)
      .setPosition(Player.SPAWN_POSITION.x, Player.SPAWN_POSITION.y)
      .setCollisionCategory(CollisionCategory.PLAYER)
      .setCollidesWith([CollisionCategory.FLOOR, CollisionCategory.BOUNDS])

    // Setup enemy detector
    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth,
      this.sprite.displayHeight,
      {
        isSensor: true,
        label: CollisionLabel.PLAYER_ENEMY_SENSOR,
      }
    )
    const compoundBody = Body.create({
      parts: [mainBody],
    })
    this.enemyDetector = this.game.matter.add
      .sprite(0, 0, '')
      .setExistingBody(compoundBody as BodyType)
      .setVisible(false)
      .setDisplaySize(this.sprite.displayWidth, this.sprite.displayHeight)
      .setFixedRotation()
      .setCollisionCategory(CollisionCategory.PLAYER_ENEMY_SENSOR)
      .setCollidesWith([CollisionCategory.ENEMY])
      .setSensor(true)

    this.inputController = new InputController(this.game, {
      player: this,
      speed: Player.SPEED,
      jumpVelocity: Player.JUMP_VELOCITY,
      dashDistance: Player.DASH_DISTANCE,
    })

    this.game.events.on('update', () => {
      this.enemyDetector.setPosition(this.sprite.x, this.sprite.y)
    })
  }
}
