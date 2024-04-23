export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'characters/player.png')

    // Tilemaps
    this.load.tilemapTiledJSON('sample', 'tilemap/sample.json')
    this.load.image('tilemap_packed', 'tilemap/tilemap_packed.png')
    this.load.image(
      'tilemap-backgrounds_packed',
      'tilemap/tilemap-backgrounds_packed.png'
    )

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

    this.load.image('sawblade', 'projectiles/sawblade.png')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
