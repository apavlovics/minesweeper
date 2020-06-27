function saveGame() {
  saveState()
  saveLevel()
}

function loadGame() {
  if (loadState()) {
      clearState()
      clearLevel()
      return true
  } else {
    return false
  }
}

/* State */

const STATE_KEY = 'state'
const EXPIRATION_PERIOD = 365

function saveState() {
  if (state != null && !state.isVisited() && !state.isValid()) {
    $.cookie(STATE_KEY, state.toString(), {
      expires: EXPIRATION_PERIOD
    })
  }
}

function loadState() {
  const stateString = $.cookie(STATE_KEY)
  if (stateString != null) {
    try {
      state = State.fromString(stateString)
      return true
    }
    catch (error) {
      // Loading failed: will return false
    }
  }
  return false
}

function clearState() {
  $.cookie(STATE_KEY, null)
}

/* Level */

const LEVEL_KEY = 'level'

function saveLevel() {
  $.cookie(LEVEL_KEY, getLevel(), {
    expires: EXPIRATION_PERIOD
  })
}

function loadLevel() {
  return $.cookie(LEVEL_KEY)
}

function clearLevel() {
  $.cookie(LEVEL_KEY, null)
}
