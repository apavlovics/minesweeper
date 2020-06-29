export class Controls {

  /* Radio Buttons */

  static get LEVEL_RADIO_BUTTON() { return 'input:radio[name="level"]' }

  static get checkedLevelRadioButton() {
    return $(Controls.LEVEL_RADIO_BUTTON + ':checked')
  }

  static get levelRadioButtons() {
    return $(Controls.LEVEL_RADIO_BUTTON)
  }

  static get level() {
    return Controls.checkedLevelRadioButton.val()
  }

  static set level(level) {
    const radioButton = $(Controls.LEVEL_RADIO_BUTTON + '[value="' + level + '"]')
    if (radioButton.length > 0) {
      radioButton.attr('checked', true)
    }
  }

  /* Buttons */

  static get VALIDATE_BUTTON() { return '#validate' }
  static get CHEAT_BUTTON() { return '#cheat' }

  static enableButtons() {
    $(Controls.VALIDATE_BUTTON).removeAttr('disabled')
    $(Controls.CHEAT_BUTTON).removeAttr('disabled')
  }

  static disableButtons() {
    $(Controls.VALIDATE_BUTTON).attr('disabled', true)
    $(Controls.CHEAT_BUTTON).attr('disabled', true)
  }

  /* Bars */

  static get NOTIFICATION_BAR() { return '#notification-bar' }
  static get MINE_COUNT() { return '#mine-count' }

  static set notification(notification) {
    $(Controls.NOTIFICATION_BAR).text(notification)
  }

  static get mineCount() {
    return parseInt($(Controls.MINE_COUNT).text())
  }

  static set mineCount(mineCount) {
    $(Controls.MINE_COUNT).text(mineCount)
  }
}
