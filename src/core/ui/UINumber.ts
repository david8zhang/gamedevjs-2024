export class UINumber {
  static createNumber(
    str: string,
    scene: Phaser.Scene,
    x: number,
    y: number,
    isDamage: boolean,
    isTurboCharged: boolean,
    onCompleteCb?: Function
  ) {
    const text = scene.add
      .text(x, y, str, {
        fontSize: isTurboCharged ? '22px' : '20px',
        color: 'black',
        fontFamily: 'space-comics',
      })
      .setOrigin(0.5)
      .setDepth(5000)

    const gradient = text.context.createLinearGradient(0, 0, 0, text.height)
    if (isDamage) {
      gradient.addColorStop(0, '#7235cc')
      gradient.addColorStop(1, '#dc57d0')
      text.setStroke('white', 5)
    } else if (isTurboCharged) {
      gradient.addColorStop(0, '#a22c3a')
      gradient.addColorStop(0.5, '#ee71cd')
      gradient.addColorStop(1, '#f98ff4')
      text.setStroke('white', 5)
    } else {
      gradient.addColorStop(0, '#ff4727')
      gradient.addColorStop(0.5, '#ff7a14')
      gradient.addColorStop(1, '#ffe719')
      text.setStroke('white', 5)
    }

    text.setFill(gradient)

    scene.add.tween({
      targets: text,
      duration: 2000,
      ease: 'Exponential.In',
      alpha: {
        getStart: () => 1,
        getEnd: () => 0,
      },
      y: y - 50,
      onComplete: () => {
        if (onCompleteCb) {
          onCompleteCb()
        }
        text.destroy()
      },
    })
  }
}
