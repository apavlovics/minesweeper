# Minesweeper

The classic game of Minesweeper, implemented using modern web technologies.

The game features:

* 3 difficulty levels;
* support for tile flagging — mark the ones, which might contain mines;
* cheat mode — reveal the locations of the mines without ending the game;
* autosave — preserve the state of the game on exit and continue from the exact same place on return.

The demo is available [on the project web page](https://continuum.lv/minesweeper/).

Technologies used:

* HTML
* CSS
* JavaScript ES6+
* [jQuery](https://jquery.com)
* [JavaScript Cookie](https://github.com/js-cookie/js-cookie)
* SVG

The game is tested on moderately recent versions of Chrome, Firefox or Safari. The game must be deployed on the web server to work correctly (`file://` protocol is not supported).

## JavaScript Code Compression

There is a script that bundles all JavaScript files into one and minifies the code. The script uses [Rollup](https://rollupjs.org/) for bundling and [Terser](https://github.com/terser/terser) for minification. Both tools must be available as the global command line tools for the script to work. To run the script, go to the project root folder and execute:

    scripts/compress.sh

As a result of running the script two files are generated:

* *minesweeper.js* with the bundled code;
* *minesweeper.min.js* with the bundled and minified code.
