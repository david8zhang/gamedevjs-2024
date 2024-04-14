import { Cell } from './Cell'

// Note: All cell sizes must be square!
export interface GridConfig {
  width: number
  height: number
  cellSize: number
}

export class Grid {
  private scene: Phaser.Scene
  public grid: Cell[][] = []
  public graphics: Phaser.GameObjects.Graphics
  public cellSize: number
  private isGridVisible: boolean = false

  constructor(scene: Phaser.Scene, config: GridConfig) {
    this.scene = scene
    this.graphics = this.scene.add.graphics()
    this.cellSize = config.cellSize
    this.initGrid(config)
    this.scene.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      (e: Phaser.Input.Keyboard.Key) => {
        if (e.keyCode == Phaser.Input.Keyboard.KeyCodes.BACKTICK) {
          this.toggleGridVisibility()
        }
      }
    )
  }

  initGrid(config: GridConfig) {
    const numCellsWidth = config.width / config.cellSize
    const numCellsHeight = config.height / config.cellSize
    let xPos = 0
    let yPos = 0
    this.grid = new Array(numCellsHeight)
      .fill(null)
      .map(() => new Array(numCellsWidth).fill(null))
    for (let i = 0; i < numCellsHeight; i++) {
      xPos = 0
      for (let j = 0; j < numCellsWidth; j++) {
        this.grid[i][j] = new Cell({
          inGameX: xPos,
          inGameY: yPos,
          gridRow: i,
          gridCol: j,
          cellSize: config.cellSize,
        })
        xPos += config.cellSize
      }
      yPos += config.cellSize
    }
  }

  toggleGridVisibility() {
    if (!this.isGridVisible) {
      this.graphics.lineStyle(1, 0xff0000, 0.2)
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[0].length; j++) {
          const cell = this.grid[i][j]
          this.graphics.strokeRectShape(cell.rectangle)
        }
      }
      this.isGridVisible = true
    } else {
      this.graphics.clear()
      this.isGridVisible = false
    }
  }

  get numRows() {
    return this.grid.length
  }

  get numCols() {
    return this.grid[0].length
  }

  hideGrid() {
    this.graphics.clear()
  }

  getCellAtRowCol(row: number, col: number) {
    return this.grid[row][col]
  }

  getCellAtWorldPosition(x: number, y: number): Cell {
    const row = Math.floor(y / this.cellSize)
    const col = Math.floor(x / this.cellSize)
    return this.grid[row][col]
  }

  withinBounds(row: number, col: number) {
    return row < this.numRows && row >= 0 && col < this.numCols && col >= 0
  }
}
