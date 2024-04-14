export interface PathfindingConfig {
  tilemap: Phaser.Tilemaps.Tilemap
  unwalkableTiles: number[]
  groundLayerName: string
}

interface NodeConfig {
  position: {
    row: number
    col: number
  }
}

export class Node {
  public position: { row: number; col: number }
  public gCost: number = -1
  public hCost: number = -1
  public parent: Node | null = null

  constructor(config: NodeConfig) {
    this.position = config.position
  }

  public get fCost() {
    return this.gCost + this.hCost
  }

  public equals(other: Node) {
    return this.position.row === other.position.row && this.position.col == other.position.col
  }
}

export class Pathfinding {
  public tilemap: Phaser.Tilemaps.Tilemap
  public unwalkableTiles: number[]
  public grid: Node[][] = []
  public groundLayerName: string

  constructor(config: PathfindingConfig) {
    this.tilemap = config.tilemap
    this.unwalkableTiles = config.unwalkableTiles
    this.groundLayerName = config.groundLayerName
    this.initGrid()
  }

  initGrid() {
    const layer = this.tilemap.getLayer(this.groundLayerName)
    this.grid = new Array(layer!.data.length)
      .fill(null)
      .map(() => new Array(layer!.data[0].length).fill(null))
    for (let i = 0; i < layer!.data.length; i++) {
      for (let j = 0; j < layer!.data[0].length; j++) {
        this.grid[i][j] = new Node({
          position: { row: i, col: j },
        })
      }
    }
  }

  public getPath(start: { row: number; col: number }, end: { row: number; col: number }) {
    const startNode: Node = this.grid[start.row][start.col]
    const endNode: Node = this.grid[end.row][end.col]

    const openSet: Node[] = []
    const closedSet: Set<String> = new Set()
    openSet.push(startNode)

    while (openSet.length > 0) {
      let currNode = openSet[0]
      let currNodeIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (
          openSet[i].fCost < currNode.fCost ||
          (openSet[i].fCost === currNode.fCost && openSet[i].hCost < currNode.hCost)
        ) {
          currNode = openSet[i]
          currNodeIndex = i
        }
      }
      openSet.splice(currNodeIndex, 1)
      closedSet.add(`${currNode.position.row},${currNode.position.col}`)

      if (currNode.equals(endNode)) {
        return this.retracePath(startNode, endNode)
      }

      const neighbors = this.getNeighbors(currNode)
      neighbors.forEach((n) => {
        if (!this.isInSet(closedSet, n)) {
          let newMovementCost = currNode.gCost + this.getDistance(currNode, n)
          if (newMovementCost < n.gCost || !this.isInArray(openSet, n)) {
            n.gCost = newMovementCost
            n.hCost = this.getDistance(n, endNode)
            n.parent = currNode

            if (!this.isInArray(openSet, n)) {
              openSet.push(n)
            }
          }
        }
      })
    }
    return []
  }

  public retracePath(startNode: Node, endNode: Node) {
    const path: Node[] = []
    let currNode: Node | null = endNode
    while (currNode !== null && !currNode.equals(startNode)) {
      path.push(currNode)
      currNode = currNode.parent
    }
    return path.reverse()
  }

  public getDistance(nodeA: Node, nodeB: Node) {
    return Phaser.Math.Distance.Between(
      nodeA.position.row,
      nodeA.position.col,
      nodeB.position.row,
      nodeB.position.col
    )
  }

  public isInArray(arr: Node[], node: Node) {
    return (
      arr.find((n) => {
        return n.position.row === node.position.row && n.position.col === node.position.col
      }) !== undefined
    )
  }

  public isInSet(set: Set<String>, node: Node) {
    return set.has(`${node.position.row},${node.position.col}`)
  }

  public getNeighbors(node: Node) {
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]
    const tileLayer = this.tilemap.getLayer(this.groundLayerName)
    const neighbors: Node[] = []
    directions.forEach((dir) => {
      const neighborRow = node.position.row + dir[0]
      const neighborCol = node.position.col + dir[1]
      if (
        neighborRow >= 0 &&
        neighborRow < tileLayer!.data.length &&
        neighborCol >= 0 &&
        neighborCol < tileLayer!.data[0].length
      ) {
        const tile = tileLayer!.data[neighborRow][neighborCol]
        if (!this.unwalkableTiles.includes(tile.index)) {
          neighbors.push(this.grid[neighborRow][neighborCol])
        }
      }
    })
    return neighbors
  }
}
