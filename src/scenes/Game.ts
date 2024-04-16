import Phaser from 'phaser'
import { Player } from '../core/Player'
import { Map } from '../core/map/Map'
import { CollisionCategory, Constants } from '../utils/Constants'
import { Monster } from '../core/Monster'
import { MonsterSpawner } from '../core/MonsterSpawner'

export default class Game extends Phaser.Scene {
  public player!: Player
  public map!: Map
  public spawners: MonsterSpawner[] = []

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

    this.matter.add
      .sprite(0, Constants.GAME_HEIGHT / 2, '')
      .setDisplaySize(1, Constants.GAME_HEIGHT)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.BOUNDS)

    this.matter.add
      .sprite(Constants.GAME_WIDTH, Constants.GAME_HEIGHT / 2, '')
      .setDisplaySize(1, Constants.GAME_HEIGHT)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.BOUNDS)

    this.matter.add
      .sprite(Constants.GAME_WIDTH / 2, 0, '')
      .setDisplaySize(Constants.GAME_WIDTH, 1)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.BOUNDS)

    this.spawnMonsters()
  }

  spawnMonsters() {
    const spawnerLayer = this.map.tilemap.getObjectLayer('Spawner')
    if (spawnerLayer) {
      const spawnerObjects = spawnerLayer.objects
      spawnerObjects.forEach((obj, index) => {
        if (index == 0) {
          const spawner = new MonsterSpawner(this, {
            position: {
              x: obj.x!,
              y: obj.y!,
            },
          })
          this.spawners.push(spawner)
        }
      })
    }
  }
}
