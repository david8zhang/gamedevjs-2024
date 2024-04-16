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

    // Monsters
    this.load.image('monster', 'characters/monsters/sample-monster.png')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
