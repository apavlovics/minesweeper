import State from "./state.js";

const EXPIRATION_PERIOD = 365;
const LEVEL_KEY = "level";
const STATE_KEY = "state";

// State

export function saveState(state) {
  if (state != null && !state.isVisited && !state.isValid) {
    Cookies.set(STATE_KEY, state.toString(), {
      expires: EXPIRATION_PERIOD,
    });
  }
}

export function loadState() {
  const stateString = Cookies.get(STATE_KEY);
  if (stateString != null) {
    try {
      return State.fromString(stateString);
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function clearState() {
  Cookies.remove(STATE_KEY);
}

// Level

export function saveLevel(level) {
  Cookies.set(LEVEL_KEY, level, {
    expires: EXPIRATION_PERIOD,
  });
}

export function loadLevel() {
  return Cookies.get(LEVEL_KEY);
}

export function clearLevel() {
  Cookies.remove(LEVEL_KEY);
}
