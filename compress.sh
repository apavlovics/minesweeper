#!/bin/sh
cd js
rollup main.js --file ../minesweeper.js
terser --compress --mangle --output ../minesweeper.min.js -- ../minesweeper.js
