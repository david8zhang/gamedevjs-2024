export interface IState {
  name: string
  onEnter?: () => void
  onUpdate?: (dt: number) => void
  onExit?: () => void
  handleInput?: (input: Phaser.Input.Keyboard.Key) => void
}

export default class StateMachine {
  // Used bind context to the state machine since state functions are defined by the class using the state machine
  private context: object
  private states = new Map<string, IState>()

  private currentState?: IState

  constructor(context: object) {
    this.context = context
  }

  addState(config: IState): StateMachine {
    this.states.set(config.name, {
      name: config.name,
      onEnter: config.onEnter?.bind(this.context),
      handleInput: config.handleInput?.bind(this.context),
      onUpdate: config.onUpdate?.bind(this.context),
      onExit: config.onExit?.bind(this.context),
    })
    return this
  }

  setState(name: string) {
    // Check if the state exists
    if (!this.states.has(name)) {
      console.warn(`Tried to change to unknown state: ${name}`)
      return
    }
    // Check if the state is already the current state
    if (this.currentState?.name === name) {
      return
    }

    // Exit current state
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit()
    }

    // Enter new state
    this.currentState = this.states.get(name)
    if (this.currentState && this.currentState.onEnter) {
      this.currentState.onEnter()
    }
  }

  update(dt: number) {
    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(dt)
    }
  }

  handleInput(input: Phaser.Input.Keyboard.Key) {
    if (this.currentState && this.currentState.handleInput) {
      this.currentState.handleInput(input)
    }
  }
}
