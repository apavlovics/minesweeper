#!/bin/sh
cd js
rollup game.js --file ../target/minesweeper.js
terser --compress --mangle --output ../target/minesweeper.min.js -- ../target/minesweeper.js
