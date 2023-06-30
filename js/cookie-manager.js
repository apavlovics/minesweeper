import { State } from './state.js'

export class CookieManager {

  /* State */

  static get STATE_KEY() { return 'state' }
  static get EXPIRATION_PERIOD() { return 365 }

  static saveState(state) {
    if (state != null && !state.isVisited && !state.isValid) {
      Cookies.set(CookieManager.STATE_KEY, state.toString(), {
        expires: CookieManager.EXPIRATION_PERIOD
      })
    }
  }

  static loadState() {
    const stateString = Cookies.get(CookieManager.STATE_KEY)
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
    Cookies.remove(CookieManager.STATE_KEY)
  }

  /* Level */

  static get LEVEL_KEY() { return 'level' }

  static saveLevel(level) {
    Cookies.set(CookieManager.LEVEL_KEY, level, {
      expires: CookieManager.EXPIRATION_PERIOD
    })
  }

  static loadLevel() {
    return Cookies.get(CookieManager.LEVEL_KEY)
  }

  static clearLevel() {
    Cookies.remove(CookieManager.LEVEL_KEY)
  }
}
