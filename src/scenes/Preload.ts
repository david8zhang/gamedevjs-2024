export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('example', 'example.png')
  }

  create() {
    this.scene.start('game')
  }
}
