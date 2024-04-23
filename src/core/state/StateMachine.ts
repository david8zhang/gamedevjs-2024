export interface IState {
  name: string
  onEnter?: () => void
  onUpdate?: (dt: number) => void
  onExit?: () => void
  handleInput?: (input: Phaser.Input.Keyboard.Key) => void
}

export default class StateMachine {
  public prevState?: IState

  private states = new Map<string, IState>()
  private currentState?: IState

  constructor() {}

  addState(state: IState): StateMachine {
    this.states.set(state.name, {
      name: state.name,
      onEnter: state.onEnter?.bind(state),
      handleInput: state.handleInput?.bind(state),
      onUpdate: state.onUpdate?.bind(state),
      onExit: state.onExit?.bind(state),
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
      this.prevState = this.currentState
    }

    // Enter new state
    this.currentState = this.states.get(name)
    if (this.currentState && this.currentState.onEnter) {
      console.log(`Entering state: ${name}`)
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
