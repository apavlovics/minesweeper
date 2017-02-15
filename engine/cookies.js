function saveGame() {
    saveState();
    saveLevel();
}

function loadGame() {
    if (loadState() == true) {
        clearState();
        clearLevel();
        return true;
    }
    return false;
}

/* State */

var STATE_KEY = 'state';
var EXPIRATION_PERIOD = 365;

function saveState() {
    if (state != null && state.isVisited() == false && state.isValid() == false) {
        $.cookie(STATE_KEY, state.toString(), {
            expires: EXPIRATION_PERIOD
        });
    }
}

function loadState() {
    var stateString = $.cookie(STATE_KEY);
    if (stateString != null) {
        try {
            state = State.fromString(stateString);
            return true;
        }
        catch (error) {
            // Loading failed: will return false
        }
    }
    return false;
}

function clearState() {
    $.cookie(STATE_KEY, null);
}

/* Level */

var LEVEL_KEY = 'level';

function saveLevel() {
    $.cookie(LEVEL_KEY, getLevel(), {
        expires: EXPIRATION_PERIOD
    });
}

function loadLevel() {
    return $.cookie(LEVEL_KEY);
}

function clearLevel() {
    $.cookie(LEVEL_KEY, null);
}