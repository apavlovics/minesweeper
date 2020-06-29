# Minesweeper

The classic game of Minesweeper, implemented using modern web technologies. The game does not use any external
image files. All UI elements, including the field, the mines and the flags, are rendered directly by the
browser. The demo is available [on the project web page](https://continuum.lv/projects/minesweeper/).

The game features:

* 3 difficulty levels;
* support for tile flagging — mark the ones, which might contain mines;
* cheat mode — reveal the locations of the mines without ending the game;
* autosave — preserve the state of the game on exit and continue from the exact same place on return.

Technologies used:

* HTML5
* CSS3
* JavaScript ES6
* [jQuery](https://jquery.com)
* [JavaScript Cookie](https://github.com/js-cookie/js-cookie)

The game is tested on moderately recent versions of Chrome, Firefox or Safari. The game must be deployed on
the web server to work correctly (`file://` protocol is not supported).
