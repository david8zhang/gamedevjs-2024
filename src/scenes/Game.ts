import Phaser from 'phaser'
import { Player } from '../core/Player'
import { Map } from '../core/map/Map'
import { Constants } from '../utils/Constants'

export default class Game extends Phaser.Scene {
  public player!: Player
  public map!: Map

  constructor() {
    super('game')
  }
  create() {
    this.map = new Map(this, {
      cellSize: 18,
      walkableLayer: 'Platforms',
      width: Constants.GAME_WIDTH,
      height: Constants.GAME_HEIGHT,
    })
    this.player = new Player(this)
    this.cameras.main.startFollow(this.player.sprite)
    this.cameras.main.setBounds(
      0,
      0,
      Constants.GAME_WIDTH,
      Constants.GAME_HEIGHT
    )

    this.matter.world.setBounds(
      0,
      0,
      Constants.GAME_WIDTH,
      Constants.GAME_HEIGHT
    )
  }
}
