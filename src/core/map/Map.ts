import {
  CollisionCategory,
  CollisionLabel,
  Constants,
} from '../../utils/Constants'
import { Grid } from './Grid'
import { Pathfinding } from './Pathfinding'

export interface MapConfig {
  width: number
  height: number
  cellSize: number
  walkableLayer: string
}

export class Map {
  private scene: Phaser.Scene
  public tilemap!: Phaser.Tilemaps.Tilemap
  private grid!: Grid
  private pathfinding: Pathfinding
  public enemyLayer!: Phaser.Tilemaps.TilemapLayer
  public groundLayerName: string
  public walkableTiles: Phaser.Tilemaps.Tile[] = []

  constructor(scene: Phaser.Scene, config: MapConfig) {
    this.scene = scene
    this.initTilemap()
    const { width, height, cellSize, walkableLayer } = config
    this.groundLayerName = walkableLayer
    this.grid = new Grid(this.scene, {
      width,
      height,
      cellSize,
    })
    this.pathfinding = new Pathfinding({
      tilemap: this.tilemap,
      groundLayerName: walkableLayer,
      unwalkableTiles: [-1],
    })

    const oceanLayer = this.tilemap.getLayer('Ocean')
    this.walkableTiles = oceanLayer?.tilemapLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => {
        return tile.index !== -1
      }
    )!
  }

  getRowColForWorldPosition(x: number, y: number) {
    const cell = this.grid.getCellAtWorldPosition(x, y)
    return { row: cell.gridRow, col: cell.gridCol }
  }

  getWorldPositionForRowCol(row: number, col: number) {
    const cell = this.grid.getCellAtRowCol(row, col)
    return { x: cell.centerX, y: cell.centerY }
  }

  getCenteredWorldPosition(worldX: number, worldY: number) {
    const cell = this.grid.getCellAtWorldPosition(worldX, worldY)
    return {
      x: cell.centerX,
      y: cell.centerY,
    }
  }

  getShortestPathBetweenTwoPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    const startRowCol = this.getRowColForWorldPosition(x1, y1)
    const endRowCol = this.getRowColForWorldPosition(x2, y2)
    return this.pathfinding.getPath(startRowCol, endRowCol)
  }

  getTileDistance(x1: number, y1: number, x2: number, y2: number) {
    const point1 = this.getRowColForWorldPosition(x1, y1)
    const point2 = this.getRowColForWorldPosition(x2, y2)
    return Phaser.Math.Distance.Snake(
      point1.col,
      point1.row,
      point2.col,
      point2.row
    )
  }

  highlightTiles(tilePositions: { row: number; col: number }[]) {
    tilePositions.forEach((position) => {
      const tile = this.tilemap.getTileAt(
        position.col,
        position.row,
        false,
        this.groundLayerName
      )
      if (tile) {
        tile.setAlpha(0.8)
      }
    })
  }

  tintTile(worldX: number, worldY: number, tint: number) {
    const tile = this.tilemap.getTileAtWorldXY(
      worldX,
      worldY,
      false,
      this.scene.cameras.main,
      this.groundLayerName
    )
    if (tile) {
      tile.setAlpha(1)
      tile.tint = tint
    }
  }

  tintTileRowCol(row: number, col: number, tint: number) {
    const tile = this.tilemap.getTileAt(col, row, false, this.groundLayerName)
    if (tile) {
      tile.setAlpha(1)
      tile.tint = tint
    }
  }

  tintTiles(tiles: { row: number; col: number }[], tint: number) {
    tiles.forEach((tile) => {
      this.tintTileRowCol(tile.row, tile.col, tint)
    })
  }

  clearAllTint() {
    for (let i = 0; i < this.grid.numRows; i++) {
      for (let j = 0; j < this.grid.numCols; j++) {
        const worldXY = this.getWorldPositionForRowCol(i, j)
        this.clearTint(worldXY.x, worldXY.y)
      }
    }
  }

  clearTint(worldX: number, worldY: number, alpha: number = 1) {
    const tile = this.tilemap.getTileAtWorldXY(
      worldX,
      worldY,
      false,
      this.scene.cameras.main,
      this.groundLayerName
    )
    if (tile) {
      tile.tint = 0xffffff
      tile.setAlpha(alpha)
    }
  }

  dehighlightTiles() {
    for (let i = 0; i < this.grid.numRows; i++) {
      for (let j = 0; j < this.grid.numCols; j++) {
        const tile = this.tilemap.getTileAt(j, i, false, this.groundLayerName)
        if (tile) {
          tile.setAlpha(1)
        }
      }
    }
  }

  isRowColWithinBounds(row: number, col: number) {
    return this.grid.withinBounds(row, col)
  }

  // Check that a tile is a ground tile (update when adding elevated surfaces)
  isValidGroundTile(row: number, col: number) {
    const tile = this.tilemap.getTileAt(col, row, false, this.groundLayerName)
    return tile !== null
  }

  isWorldXYWithinBounds(worldX: number, worldY: number) {
    return (
      worldX >= 0 &&
      worldX < Constants.GAME_WIDTH &&
      worldY >= 0 &&
      worldY < Constants.GAME_HEIGHT
    )
  }

  initTilemap() {
    this.tilemap = this.scene.make.tilemap({
      key: 'sample',
    })
    const tilesetPlatform = this.tilemap.addTilesetImage(
      'tilemap_packed',
      'tilemap_packed',
      18,
      18
    )!
    const tilesetBG = this.tilemap.addTilesetImage(
      'tilemap-backgrounds_packed',
      'tilemap-backgrounds_packed',
      18,
      18
    )!
    this.createLayer('Background', tilesetBG)
    const platformLayer = this.createLayer('Platforms', tilesetPlatform)
    platformLayer.forEachTile(
      (tile) => {
        this.scene.matter.add
          .sprite(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.height / 2,
            '',
            undefined,
            { label: CollisionLabel.FLOOR }
          )
          .setVisible(false)
          .setDisplaySize(tile.width, tile.height)
          .setStatic(true)
          .setOrigin(0, 0)
          .setCollisionCategory(CollisionCategory.FLOOR)
      },
      this,
      0,
      0,
      Constants.GAME_WIDTH,
      Constants.GAME_HEIGHT,
      { isNotEmpty: true }
    )

    const wallsLayer = this.createLayer('Walls', tilesetPlatform)
    wallsLayer.forEachTile(
      (tile) => {
        this.scene.matter.add
          .sprite(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.height / 2,
            '',
            undefined,
            {
              label: CollisionLabel.WALLS,
            }
          )
          .setVisible(false)
          .setDisplaySize(tile.width, tile.height)
          .setStatic(true)
          .setOrigin(0, 0)
          .setCollisionCategory(CollisionCategory.WALLS)
      },
      this,
      0,
      0,
      Constants.GAME_WIDTH,
      Constants.GAME_HEIGHT,
      { isNotEmpty: true }
    )
  }

  getLayer(layerName: string) {
    return this.tilemap.getLayer(layerName)
  }

  createLayer(layerName: string, tileset: Phaser.Tilemaps.Tileset) {
    const layer = this.tilemap.createLayer(layerName, tileset)!
    layer.setOrigin(0)
    layer.setCollisionByExclusion([-1])
    return layer
  }

  getAllValidSquaresWithinRange(
    startingPos: { row: number; col: number },
    range: number
  ): { row: number; col: number }[] {
    const { row, col } = startingPos
    const queue = [{ row, col }]
    const seen = new Set<string>()
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]
    const squares: { row: number; col: number }[] = []
    let distance = 0
    while (queue.length > 0 && distance <= range) {
      const queueSize = queue.length
      for (let i = 0; i < queueSize; i++) {
        const cell = queue.shift()
        if (cell) {
          squares.push(cell)
          directions.forEach((dir) => {
            const newRow = dir[0] + cell.row
            const newCol = dir[1] + cell.col
            if (
              !seen.has(`${newRow},${newCol}`) &&
              this.isRowColWithinBounds(newRow, newCol) &&
              this.isValidGroundTile(newRow, newCol)
            ) {
              seen.add(`${newRow},${newCol}`)
              queue.push({ row: newRow, col: newCol })
            }
          })
        }
      }
      distance++
    }
    return squares
  }
}
