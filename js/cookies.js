import {State} from './state.js'

export class Cookies {

  /* State */

  static get STATE_KEY() { return 'state' }
  static get EXPIRATION_PERIOD() { return 365 }

  static saveState(state) {
    if (state != null && !state.isVisited && !state.isValid) {
      $.cookie(Cookies.STATE_KEY, state.toString(), {
        expires: Cookies.EXPIRATION_PERIOD
      })
    }
  }

  static loadState() {
    const stateString = $.cookie(Cookies.STATE_KEY)
    if (stateString && stateString != 'null') {
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
    $.cookie(Cookies.STATE_KEY, null)
  }

  /* Level */

  static get LEVEL_KEY() { return 'level' }

  static saveLevel(level) {
    $.cookie(Cookies.LEVEL_KEY, level, {
      expires: Cookies.EXPIRATION_PERIOD
    })
  }

  static loadLevel() {
    return $.cookie(Cookies.LEVEL_KEY)
  }

  static clearLevel() {
    $.cookie(Cookies.LEVEL_KEY, null)
  }
}
