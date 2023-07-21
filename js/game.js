import State from "./state.js";
import * as cookie from "./cookie.js";
import * as ui from "./ui.js";

// Global game state
let state = null;

export default function initializeGame() {
  // Expose functions via window to ensure New Game and Cheat buttons are working
  window.resetField = resetField;
  window.revealField = revealField;

  $(document).ready(() => {
    ui.getMinesweeper().html(`
        <div id="menu">
          <div>
            <input type="radio" id="easy" name="level" value="easy" checked
              data-row-count="8" data-column-count="8" data-mine-count="10"><label for="easy"> Easy</label>
          </div>
          <div>
            <input type="radio" id="medium" name="level" value="medium"
              data-row-count="8" data-column-count="16" data-mine-count="25"><label for="medium"> Medium</label>
          </div>
          <div>
            <input type="radio" id="hard" name="level" value="hard"
              data-row-count="16" data-column-count="16" data-mine-count="45"><label for="hard"> Hard</label>
          </div>
          <button id="new-game" onclick="resetField()">New Game</button>
          <button id="cheat" onclick="revealField()" disabled>Cheat</button>
        </div>
        <div>
          <div id="title">Minesweeper</div>
          <table id="field"></table>
          <div id="mine-count-bar">
            <div class="mine"></div>
            <div id="mine-count"></div>
          </div>
        </div>
      `);
    createField();
  });
  $(window).on("unload", () => {
    cookie.saveState(state);
    cookie.saveLevel(ui.getLevel());
  });
}

function createField() {
  let rowCount, columnCount, mineCount;

  const loadStateOrFieldParameters = () => {
    state = cookie.loadState();
    if (state != null) {
      cookie.clearState();
      cookie.clearLevel();

      rowCount = state.rowCount;
      columnCount = state.columnCount;
      mineCount = state.mineCount;

      let wasChecked = false;
      ui.getLevelRadioButtons().each((_, element) => {
        const button = $(element);
        if (
          button.attr("data-row-count") == rowCount &&
          button.attr("data-column-count") == columnCount &&
          button.attr("data-mine-count") == mineCount
        ) {
          button.attr("checked", true);
          wasChecked = true;
        }
      });
      if (!wasChecked) {
        ui.setTitle("Custom config, eh?");
      }
      ui.enableCheatButton();
    } else {
      // Restore level if possible
      const level = cookie.loadLevel();
      if (level != null) {
        cookie.clearLevel();
        ui.setLevel(level);
      }
      const button = ui.getCheckedLevelRadioButton();
      rowCount = parseInt(button.attr("data-row-count"));
      columnCount = parseInt(button.attr("data-column-count"));
      mineCount = parseInt(button.attr("data-mine-count"));
    }
  };

  const prepareField = () => {
    $(".cell")
      .mousedown((event) => {
        const td = $(event.currentTarget);
        const cell = resolveCell(td);
        const marked = cell != null ? cell.marked : false;
        if (!marked || event.which == 3) {
          td.removeClass("cell").addClass("cell-active");
        }
      })
      .mouseleave((event) => {
        $(event.currentTarget).removeClass("cell-active").addClass("cell");
      })
      .mouseup((event) => {
        const td = $(event.currentTarget);

        // Handle mouse button releases only on active cells
        if (td.hasClass("cell-active")) {
          td.removeClass("cell-active").addClass("cell");

          // Generate new state if needed
          const [y, x] = resolveCoordinates(td);
          if (state == null) {
            state = State.generateState(rowCount, columnCount, mineCount, [y, x]);
            ui.enableCheatButton();
          }

          const cell = state.cells[y][x];
          if (!cell.visited) {
            // Left mouse button released
            if (event.which == 1) {
              if (!cell.marked) {
                if (cell.hasMine || cell.value > 0) {
                  visitCell(td, cell, true, true);
                } else {
                  const coordinates = state.calculateCoordinatesToVisit(y, x);
                  coordinates.forEach((coordinate) => {
                    const [currentY, currentX] = coordinate;
                    const currentCell = state.cells[currentY][currentX];
                    if (!currentCell.visited) {
                      const td = $(`#cell-${currentY}-${currentX}`);
                      visitCell(td, currentCell, false, true);
                    }
                  });
                }

                // Game over
                if (cell.hasMine) {
                  visitField();
                } else {
                  validateField(false);
                }
              }
            }

            // Right mouse button released
            else if (event.which == 3) {
              markUnmarkCell(td, cell, true);
            }
          }
        }
      });

    // Disable context menu
    ui.getField().bind("contextmenu", () => false);

    // Set frame size if located in iframe
    if (self != top) {
      const minesweeper = ui.getMinesweeper();
      parent.setFrameSize(`${minesweeper.outerWidth(true)}px`, `${minesweeper.outerHeight(true)}px`);
    }
  };

  loadStateOrFieldParameters();
  ui.setMineCount(mineCount);

  const field = ui.getField();
  const rows = Array(rowCount);
  const cells = Array(columnCount);

  for (const y of rows.keys()) {
    rows[y] = $("<tr></tr>");
    for (const x of cells.keys()) {
      cells[x] = $("<td></td>");
      cells[x].attr("id", `cell-${y}-${x}`);
      cells[x].attr("data-row", y);
      cells[x].attr("data-column", x);

      // Restore field state
      if (state == null) {
        cells[x].addClass("cell");
      } else {
        const cell = state.cells[y][x];
        if (cell.visited) {
          visitCell(cells[x], cell, false, false);
        } else {
          cells[x].addClass("cell");
          if (cell.marked) {
            markUnmarkCell(cells[x], cell, false);
          }
        }
      }
      rows[y].append(cells[x]);
    }
    field.append(rows[y]);
  }
  prepareField();
}

function resetField() {
  ui.disableCheatButton();
  ui.setTitle("Minesweeper");

  // Remove current state
  state = null;

  // Regenerate field
  ui.getField().empty();
  createField();
}

function visitField() {
  ui.disableCheatButton();
  ui.setTitle("Game Over");

  state.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell.visited) {
        const td = $(`#cell-${y}-${x}`);
        visitCell(td, cell, false, true);
      }
    });
  });
}

function validateField(shouldVisitField) {
  if (state.isValid) {
    ui.disableCheatButton();
    ui.setTitle("Victory!");

    $(".cell").each((_, element) => {
      const td = $(element);
      const cell = resolveCell(td);
      if (!cell.marked) {
        markUnmarkCell(td, cell, true);
      }
      td.unbind();
    });
  } else if (shouldVisitField) visitField();
}

function revealField() {
  ui.setTitle("Cheater!");

  const revealCell = (td, cell) => {
    if (cell.hasMine) {
      if (cell.marked) {
        cell.marked = false;
        ui.incMineCount();
      }
      td.html('<div class="mine-revealed"></div>');
    }
  };

  state.mineCoordinates.forEach((mineCoordinate) => {
    const [y, x] = mineCoordinate;
    const cell = state.cells[y][x];
    if (!cell.visited) {
      const td = $(`#cell-${y}-${x}`);
      revealCell(td, cell);
    }
  });
}

function visitCell(td, cell, hasExploded, shouldChangeState) {
  if (shouldChangeState) {
    cell.visited = true;
    if (cell.marked) {
      cell.marked = false;
      ui.incMineCount();
    }
  }

  const getCellColor = (value) => {
    switch (value) {
      // See :root CSS variables for color definitions
      case 1:
        return "blue";
      case 2:
        return "green";
      case 3:
        return "red";
      case 4:
        return "dark-blue";
      case 5:
        return "dark-red";
      case 6:
        return "teal";
      case 7:
        return "purple";
      default:
        return "black";
    }
  };

  td.unbind().removeClass();
  if (cell.hasMine) {
    if (hasExploded) {
      td.addClass("cell-mine-exploded");
    } else {
      td.addClass("cell-mine-visited");
    }
    td.html('<div class="mine"></div>');
  } else {
    td.addClass("cell-visited").empty();
    if (cell.value > 0) {
      td.css("color", `rgb(var(--${getCellColor(cell.value)}))`).text(cell.value);
    }
  }
}

function markUnmarkCell(td, cell, shouldChangeState) {
  if (shouldChangeState) {
    cell.marked = !cell.marked;
  }

  if (cell.marked) {
    td.html('<div class="flag"></div>');
    ui.decMineCount();
  } else {
    td.empty();
    ui.incMineCount();
  }
}

function resolveCoordinates(td) {
  const y = parseInt(td.attr("data-row"));
  const x = parseInt(td.attr("data-column"));
  return [y, x];
}

function resolveCell(td) {
  const [y, x] = resolveCoordinates(td);
  return state != null ? state.cells[y][x] : null;
}
