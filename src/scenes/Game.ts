import Phaser from 'phaser'
import { Player } from '../core/Player'
import { Map } from '../core/map/Map'
import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../utils/Constants'
import { MonsterSpawner } from '../core/MonsterSpawner'
import { createAnims } from '../core/anims/createAnims'
import { BodyType } from 'matter'

export default class Game extends Phaser.Scene {
  public player!: Player
  public map!: Map
  public spawners: MonsterSpawner[] = []
  public static instance: Game

  constructor() {
    super('game')
    if (!Game.instance) {
      Game.instance = this
    }
  }
  create() {
    createAnims(this.anims)

    this.add
      .image(Constants.GAME_WIDTH / 2, Constants.GAME_HEIGHT / 2, 'tile-bg')
      .setDisplaySize(Constants.GAME_WIDTH, Constants.GAME_HEIGHT)

    this.map = new Map(this, {
      cellSize: 32,
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

    const leftWall = this.matter.add
      .sprite(0, Constants.GAME_HEIGHT / 2, '', undefined, {
        label: CollisionLabel.BOUNDS,
      })
      .setDisplaySize(1, Constants.GAME_HEIGHT * 2)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.BOUNDS)
      .setFriction(0)

    const rightWall = this.matter.add
      .sprite(Constants.GAME_WIDTH, Constants.GAME_HEIGHT / 2, '', undefined, {
        label: CollisionLabel.BOUNDS,
      })
      .setDisplaySize(1, Constants.GAME_HEIGHT * 2)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.BOUNDS)
      .setFriction(0)

    const bottomWall = this.matter.add
      .sprite(
        Constants.GAME_WIDTH / 2,
        Constants.GAME_HEIGHT - 64,
        '',
        undefined,
        {
          label: CollisionLabel.FLOOR,
        }
      )
      .setDisplaySize(Constants.GAME_WIDTH, 1)
      .setVisible(false)
      .setStatic(true)
      .setCollisionCategory(CollisionCategory.FLOOR)

    this.matter.world.setBodyRenderStyle(leftWall.body as BodyType, 0xff0000)
    this.matter.world.setBodyRenderStyle(rightWall.body as BodyType, 0xff0000)
    this.matter.world.setBodyRenderStyle(bottomWall.body as BodyType, 0xff0000)

    this.spawnMonsters()
  }

  spawnMonsters() {
    const spawnerLayer = this.map.tilemap.getObjectLayer('Spawner')
    if (spawnerLayer) {
      const spawnerObjects = spawnerLayer.objects
      spawnerObjects.forEach((obj) => {
        const spawner = new MonsterSpawner(this, {
          position: {
            x: obj.x!,
            y: obj.y!,
          },
        })
        this.spawners.push(spawner)
      })
    }
  }

  update(t: number, dt: number) {
    this.player.update(t, dt)
  }
}
