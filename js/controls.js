export class Controls {

  // Minesweeper

  static get minesweeper() {
    return $('#minesweeper')
  }

  // Field

  static get field() {
    return $('#field')
  }

  // Level radio buttons

  static get LEVEL_RADIO_BUTTON() { return 'input:radio[name="level"]' }

  static get checkedLevelRadioButton() {
    return $(`${Controls.LEVEL_RADIO_BUTTON}:checked`)
  }

  static get levelRadioButtons() {
    return $(Controls.LEVEL_RADIO_BUTTON)
  }

  static get level() {
    return Controls.checkedLevelRadioButton.val()
  }

  static set level(level) {
    const radioButton = $(`${Controls.LEVEL_RADIO_BUTTON}[value="${level}"]`)
    if (radioButton.length > 0) {
      radioButton.attr('checked', true)
    }
  }

  // Cheat button

  static get CHEAT_BUTTON() { return '#cheat' }

  static enableCheatButton() {
    $(Controls.CHEAT_BUTTON).removeAttr('disabled')
  }

  static disableCheatButton() {
    $(Controls.CHEAT_BUTTON).attr('disabled', true)
  }

  // Title

  static set title(title) {
    $('#title').text(title)
  }

  // Mine count

  static get MINE_COUNT() { return '#mine-count' }

  static get mineCount() {
    return parseInt($(Controls.MINE_COUNT).text())
  }

  static set mineCount(mineCount) {
    $(Controls.MINE_COUNT).text(mineCount)
  }
}
