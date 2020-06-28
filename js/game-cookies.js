import {State} from './state.js'

export class GameCookies {

  /* State */

  static get STATE_KEY() { return 'state' }
  static get EXPIRATION_PERIOD() { return 365 }

  static saveState(state) {
    if (state != null && !state.isVisited && !state.isValid) {
      Cookies.set(GameCookies.STATE_KEY, state.toString(), {
        expires: GameCookies.EXPIRATION_PERIOD
      })
    }
  }

  static loadState() {
    const stateString = Cookies.get(GameCookies.STATE_KEY)
    if (stateString != null) {
      try {
        return State.fromString(stateString)
      }
      catch (error) {
        console.error(error)
      }
    }
    return null
  }

  static clearState() {
    Cookies.remove(GameCookies.STATE_KEY)
  }

  /* Level */

  static get LEVEL_KEY() { return 'level' }

  static saveLevel(level) {
    Cookies.set(GameCookies.LEVEL_KEY, level, {
      expires: GameCookies.EXPIRATION_PERIOD
    })
  }

  static loadLevel() {
    return Cookies.get(GameCookies.LEVEL_KEY)
  }

  static clearLevel() {
    Cookies.remove(GameCookies.LEVEL_KEY)
  }
}
