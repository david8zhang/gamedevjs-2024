export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    // this.load.image('player', 'characters/player.png')

    // Tilemaps
    this.load.tilemapTiledJSON('tilemap-1', 'tilemap/tilemap-1.json')
    this.load.image('industrial-tileset', 'tilemap/industrial-tileset.png')
    this.load.image('tile-bg', 'tilemap/tile-bg.png')

    // Skill icons
    this.load.image('dash', 'icons/dash.png')
    this.load.image('jump', 'icons/jump.png')
    this.load.image('throwing-stars', 'icons/throwing-stars.png')

    // Monsters
    this.load.image('monster', 'characters/monsters/sample-monster.png')

    // Animations
    this.load.atlas(
      'slash-vertical-hit',
      'animations/slash-vertical-hit.png',
      'animations/slash-vertical-hit.json'
    )
    this.load.atlas(
      'slash-vertical',
      'animations/slash-vertical.png',
      'animations/slash-vertical.json'
    )
    this.load.atlas(
      'slash-horizontal',
      'animations/slash-horizontal.png',
      'animations/slash-horizontal.json'
    )
    this.load.atlas(
      'slash-horizontal-hit',
      'animations/slash-horizontal-hit.png',
      'animations/slash-horizontal-hit.json'
    )
    this.load.atlas(
      'dash-strike',
      'animations/dash-strike.png',
      'animations/dash-strike.json'
    )

    this.load.image('sawblade', 'projectiles/sawblade.png')

    // Player
    this.load.aseprite({
      key: 'player',
      atlasURL: 'characters/player.json',
      textureURL: 'characters/player.png',
    })

    // Sound
    this.load.audio('bgm', 'audio/bgm.mp3')
    this.load.audio('slash', 'audio/slash.mp3')
    this.load.audio('dash', 'audio/dash.mp3')
    this.load.audio('impact', 'audio/impact.mp3')
    this.load.audio('jump', 'audio/jump.wav')
    this.load.audio('turbo', 'audio/turbocharged.mp3')
    this.load.audio('throw', 'audio/throw.mp3')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
