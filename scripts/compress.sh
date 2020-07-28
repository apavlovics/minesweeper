#!/bin/sh
cd js
echo "Will bundle all JavaScript files into one and minify the code..."
rollup main.js --file ../minesweeper.js
terser --compress --mangle --output ../minesweeper.min.js -- ../minesweeper.js
echo "Done: minesweeper.js and minesweeper.min.js are generated"
