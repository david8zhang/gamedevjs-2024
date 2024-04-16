import Game from '../scenes/Game'
import { Monster } from './Monster'

export interface MonsterSpawnerConfig {
  position: {
    x: number
    y: number
  }
}

export class MonsterSpawner {
  private static MAX_MONSTERS = 2
  private game: Game
  private monsters: Monster[] = []

  constructor(game: Game, config: MonsterSpawnerConfig) {
    this.game = game
    this.game.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        if (this.monsters.length < MonsterSpawner.MAX_MONSTERS) {
          const monster = new Monster(this.game, {
            position: {
              x: config.position.x,
              y: config.position.y,
            },
          })
          this.monsters.push(monster)
        }
      },
    })
  }
}
