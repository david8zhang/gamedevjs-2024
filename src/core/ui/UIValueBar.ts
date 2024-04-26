interface UIValueBarConfig {
  x: number
  y: number
  maxValue: number
  height: number
  width: number
  borderWidth: number
  bgColor?: number
  radius?: number
  fillColor?: number
  showBorder?: boolean
  isVertical?: boolean
  depth?: number
  hideBg?: boolean
}

export class UIValueBar {
  graphics: Phaser.GameObjects.Graphics
  x: number
  y: number
  maxValue: number
  currValue: number

  height: number
  width: number
  showBorder: boolean
  borderWidth: number
  radius: number = 4
  isVertical: boolean = false
  bgColor: number = 0x000000
  fillColor: number = 0x000000
  hideBg: boolean = false

  constructor(scene: Phaser.Scene, config: UIValueBarConfig) {
    this.graphics = new Phaser.GameObjects.Graphics(scene)
    this.graphics.setDepth(1000)
    const {
      x,
      y,
      maxValue,
      width,
      height,
      showBorder,
      borderWidth,
      bgColor,
      fillColor,
      radius,
    } = config
    this.x = x
    this.y = y
    this.maxValue = maxValue
    this.currValue = maxValue
    this.width = width
    this.height = height
    this.borderWidth = borderWidth
    if (radius !== undefined) {
      this.radius = radius
    }

    if (bgColor) {
      this.bgColor = bgColor
    }

    if (fillColor) {
      this.fillColor = fillColor
    }

    if (config.hideBg) {
      this.hideBg = config.hideBg
    }

    if (config.isVertical) {
      this.isVertical = config.isVertical
    }

    this.showBorder = showBorder || false
    scene.add.existing(this.graphics)
    this.draw()
    this.graphics.setDepth(config.depth ? config.depth : 100)
  }

  setVisible(visible: boolean) {
    this.graphics.setVisible(visible)
  }

  decrease(amount: number) {
    this.currValue = Math.max(0, this.currValue - amount)
    this.draw()
    return this.currValue === 0
  }

  increase(amount: number) {
    this.currValue = Math.min(this.maxValue, this.currValue + amount)
    this.draw()
    return this.currValue === this.maxValue
  }

  setMaxValue(maxValue: number) {
    this.maxValue = maxValue
    this.draw()
  }

  setCurrValue(currValue: number) {
    this.currValue = currValue
    this.draw()
  }

  get depth() {
    return this.graphics.depth
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
    this.draw()
  }

  draw() {
    this.graphics.clear()

    // Border
    const borderWidth = this.showBorder ? this.borderWidth : 0
    this.graphics.fillStyle(this.bgColor)

    if (!this.hideBg) {
      this.graphics.fillRoundedRect(
        this.x - borderWidth / 2,
        this.y - borderWidth / 2,
        this.width + borderWidth,
        this.height + borderWidth,
        this.radius
      )
    }

    const percentage = this.currValue / this.maxValue
    this.graphics.fillStyle(this.fillColor ? this.fillColor : 0xc41e3a)

    if (this.isVertical) {
      const length = Math.round(percentage * this.height)
      const remainderLength = Math.round((1 - percentage) * this.height)
      this.graphics.fillRoundedRect(
        this.x,
        this.y + remainderLength,
        this.width,
        length,
        this.radius
      )
    } else {
      const length = Math.floor(percentage * this.width)
      if (length > 0) {
        this.graphics.fillRoundedRect(
          this.x,
          this.y,
          length,
          this.height,
          this.radius
        )
      }
    }
  }

  destroy() {
    this.graphics.destroy()
  }
}
