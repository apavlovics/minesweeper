/* Radio Buttons */

class Controls {

  static get LEVEL_RADIO_BUTTON_SELECTOR() { return 'input:radio[name="level"]' }

  static get checkedLevelRadioButton() {
    return $(Controls.LEVEL_RADIO_BUTTON_SELECTOR + ':checked')
  }

  static get levelRadioButtons() {
    return $(Controls.LEVEL_RADIO_BUTTON_SELECTOR)
  }

  static get level() {
    return Controls.checkedLevelRadioButton.val()
  }

  static set level(level) {
    const radioButton = $(Controls.LEVEL_RADIO_BUTTON_SELECTOR + '[value="' + level + '"]')
    if (radioButton.length > 0) {
      radioButton.attr('checked', true)
    }
  }

  /* Buttons */

  static get VALIDATE_BUTTON_SELECTOR() { return '#validate' }
  static get CHEAT_BUTTON_SELECTOR() { return '#cheat' }

  static enableButtons() {
    $(Controls.VALIDATE_BUTTON_SELECTOR).removeAttr('disabled')
    $(Controls.CHEAT_BUTTON_SELECTOR).removeAttr('disabled')
  }

  static disableButtons() {
    $(Controls.VALIDATE_BUTTON_SELECTOR).attr('disabled', true)
    $(Controls.CHEAT_BUTTON_SELECTOR).attr('disabled', true)
  }

  /* Bars */

  static get NOTIFICATION_BAR_SELECTOR() { return '#notification-bar' }
  static get MINE_COUNT_BAR_SELECTOR() { return '#mine-count-bar' }

  static get notificationBar() {
    return $(Controls.NOTIFICATION_BAR_SELECTOR)
  }

  static set notification(notification) {
    Controls.notificationBar.text(notification)
  }

  static get mineCountBar() {
    return $(Controls.MINE_COUNT_BAR_SELECTOR)
  }

  static get mineCount() {
    return parseInt(Controls.mineCountBar.text())
  }

  static set mineCount(mineCount) {
    Controls.mineCountBar.text(mineCount)
  }
}
