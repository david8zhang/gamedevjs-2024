import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('game')
  }
  create() {
    this.add.image(250, 250, 'example').setScale(0.5)
    this.add.text(200, 100, 'Hello there')
  }
}
