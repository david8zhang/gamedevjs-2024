// import Game from '../scenes/Game'
// import { Player } from './Player'

// export interface InputControllerConfig {
//   player: Player
//   speed: number
//   jumpVelocity: number
//   dashDistance: number
// }

// export class InputController {
//   private game: Game
//   private keyRight!: Phaser.Input.Keyboard.Key
//   private keyLeft!: Phaser.Input.Keyboard.Key
//   private player: Player
//   private speed: number

//   constructor(game: Game, config: InputControllerConfig) {
//     this.game = game
//     this.keyRight = this.game.input.keyboard!.addKey(
//       Phaser.Input.Keyboard.KeyCodes.RIGHT
//     )
//     this.keyLeft = this.game.input.keyboard!.addKey(
//       Phaser.Input.Keyboard.KeyCodes.LEFT
//     )
//     this.player = config.player
//     this.speed = config.speed
//     this.game.input.keyboard!.on(
//       Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
//       (e: Phaser.Input.Keyboard.Key) => {
//         switch (e.keyCode) {
//           case Phaser.Input.Keyboard.KeyCodes.SPACE: {
//             this.player.jump()
//             break
//           }
//           case Phaser.Input.Keyboard.KeyCodes.S: {
//             this.player.dash()
//             break
//           }
//           case Phaser.Input.Keyboard.KeyCodes.F: {
//             this.player.attack()
//           }
//           default:
//             return
//         }
//       }
//     )
//     this.game.events.on('update', this.update, this)
//   }

//   update() {
//     if (!this.player.isDashing && !this.player.isDead) {
//       const sprite = this.player.sprite
//       if (this.keyLeft.isDown) {
//         sprite.setFlipX(false)
//         sprite.setVelocityX(-this.speed)
//       } else if (this.keyRight.isDown) {
//         sprite.setFlipX(true)
//         sprite.setVelocityX(this.speed)
//       }
//     }
//   }
// }
