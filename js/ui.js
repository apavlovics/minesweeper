// Minesweeper

export function getMinesweeper() {
  return $("#minesweeper");
}

// Field

export function getField() {
  return $("#field");
}

// Level radio buttons

const LEVEL_RADIO_BUTTONS = 'input:radio[name="level"]';

export function getLevelRadioButtons() {
  return $(LEVEL_RADIO_BUTTONS);
}

export function getCheckedLevelRadioButton() {
  return $(`${LEVEL_RADIO_BUTTONS}:checked`);
}

export function getLevel() {
  return getCheckedLevelRadioButton().val();
}

export function setLevel(level) {
  const radioButton = $(`${LEVEL_RADIO_BUTTONS}[value="${level}"]`);
  if (radioButton.length > 0) {
    radioButton.attr("checked", true);
  }
}

// Cheat button

const CHEAT_BUTTON = "#cheat";

export function enableCheatButton() {
  $(CHEAT_BUTTON).removeAttr("disabled");
}

export function disableCheatButton() {
  $(CHEAT_BUTTON).attr("disabled", true);
}

// Title

export function setTitle(title) {
  $("#title").text(title);
}

// Mine count

const MINE_COUNT = "#mine-count";

function getMineCount() {
  return parseInt($(MINE_COUNT).text());
}

export function setMineCount(mineCount) {
  $(MINE_COUNT).text(mineCount);
}

export function incMineCount() {
  setMineCount(getMineCount() + 1);
}

export function decMineCount() {
  setMineCount(getMineCount() - 1);
}
