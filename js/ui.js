export class UI {
  // Minesweeper

  static get minesweeper() {
    return $("#minesweeper");
  }

  // Field

  static get field() {
    return $("#field");
  }

  // Level radio buttons

  static get LEVEL_RADIO_BUTTONS() {
    return 'input:radio[name="level"]';
  }

  static get levelRadioButtons() {
    return $(UI.LEVEL_RADIO_BUTTONS);
  }

  static get checkedLevelRadioButton() {
    return $(`${UI.LEVEL_RADIO_BUTTONS}:checked`);
  }

  static get level() {
    return UI.checkedLevelRadioButton.val();
  }

  static set level(level) {
    const radioButton = $(`${UI.LEVEL_RADIO_BUTTONS}[value="${level}"]`);
    if (radioButton.length > 0) {
      radioButton.attr("checked", true);
    }
  }

  // Cheat button

  static enableCheatButton() {
    $("#cheat").removeAttr("disabled");
  }

  static disableCheatButton() {
    $("#cheat").attr("disabled", true);
  }

  // Title

  static set title(title) {
    $("#title").text(title);
  }

  // Mine count

  static get mineCount() {
    return parseInt($("#mine-count").text());
  }

  static set mineCount(mineCount) {
    $("#mine-count").text(mineCount);
  }
}
