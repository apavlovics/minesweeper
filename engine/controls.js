/* Radio Buttons */

var LEVEL_RADIO_BUTTON_SELECTOR = 'input:radio[name="level"]';

function getCheckedLevelRadioButton() {
    return $(LEVEL_RADIO_BUTTON_SELECTOR + ':checked');
}

function getLevelRadioButtons() {
    return $(LEVEL_RADIO_BUTTON_SELECTOR);
}

function getLevel() {
    return getCheckedLevelRadioButton().val();
}

function setLevel(level) {
    var radioButton = $(LEVEL_RADIO_BUTTON_SELECTOR + '[value="' + level + '"]');
    if (radioButton.length > 0)
        radioButton.attr('checked', true);
}

/* Buttons */

var VALIDATE_BUTTON_SELECTOR = '#validate';
var CHEAT_BUTTON_SELECTOR = '#cheat';

function enableButtons() {
    $(VALIDATE_BUTTON_SELECTOR).removeAttr('disabled');
    $(CHEAT_BUTTON_SELECTOR).removeAttr('disabled');
}

function disableButtons() {
    $(VALIDATE_BUTTON_SELECTOR).attr('disabled', true);
    $(CHEAT_BUTTON_SELECTOR).attr('disabled', true);
}

/* Bars */

var NOTIFICATION_BAR_SELECTOR = '#notification-bar';
var MINE_COUNT_BAR_SELECTOR = '#mine-count-bar';

function getNotificationBar() {
    return $(NOTIFICATION_BAR_SELECTOR);
}

function setNotification(notification) {
    getNotificationBar().text(notification);
}

function getMineCountBar() {
    return $(MINE_COUNT_BAR_SELECTOR);
}

function getMineCount() {
    return parseInt(getMineCountBar().text());
}

function setMineCount(mineCount) {
    getMineCountBar().text(mineCount);
}
