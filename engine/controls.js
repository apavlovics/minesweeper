/* Radio Buttons */

const LEVEL_RADIO_BUTTON_SELECTOR = 'input:radio[name="level"]'

function getCheckedLevelRadioButton() {
  return $(LEVEL_RADIO_BUTTON_SELECTOR + ':checked')
}

function getLevelRadioButtons() {
  return $(LEVEL_RADIO_BUTTON_SELECTOR)
}

function getLevel() {
  return getCheckedLevelRadioButton().val()
}

function setLevel(level) {
  const radioButton = $(LEVEL_RADIO_BUTTON_SELECTOR + '[value="' + level + '"]')
  if (radioButton.length > 0) {
    radioButton.attr('checked', true)
  }
}

/* Buttons */

const VALIDATE_BUTTON_SELECTOR = '#validate'
const CHEAT_BUTTON_SELECTOR = '#cheat'

function enableButtons() {
  $(VALIDATE_BUTTON_SELECTOR).removeAttr('disabled')
  $(CHEAT_BUTTON_SELECTOR).removeAttr('disabled')
}

function disableButtons() {
  $(VALIDATE_BUTTON_SELECTOR).attr('disabled', true)
  $(CHEAT_BUTTON_SELECTOR).attr('disabled', true)
}

/* Bars */

const NOTIFICATION_BAR_SELECTOR = '#notification-bar'
const MINE_COUNT_BAR_SELECTOR = '#mine-count-bar'

function getNotificationBar() {
  return $(NOTIFICATION_BAR_SELECTOR)
}

function setNotification(notification) {
  getNotificationBar().text(notification)
}

function getMineCountBar() {
  return $(MINE_COUNT_BAR_SELECTOR)
}

function getMineCount() {
  return parseInt(getMineCountBar().text())
}

function setMineCount(mineCount) {
  getMineCountBar().text(mineCount)
}
