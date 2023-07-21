import State from "./state.js";
import * as cookie from "./cookie.js";
import * as ui from "./ui.js";

export class Game {
  static initialize() {
    window.Game = Game;
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
          <button id="new-game" onclick="Game.resetField()">New Game</button>
          <button id="cheat" onclick="Game.revealField()" disabled>Cheat</button>
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
      Game.createField();
    });
    $(window).on("unload", () => {
      cookie.saveState(Game.state);
      cookie.saveLevel(ui.getLevel());
    });
  }

  static createField() {
    let rowCount, columnCount, mineCount;

    const loadStateOrFieldParameters = () => {
      Game.state = cookie.loadState();
      if (Game.state != null) {
        cookie.clearState();
        cookie.clearLevel();

        rowCount = Game.state.rowCount;
        columnCount = Game.state.columnCount;
        mineCount = Game.state.mineCount;

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
          const cell = Game.resolveCell(td);
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
            const [y, x] = Game.resolveCoordinates(td);
            if (Game.state == null) {
              Game.state = State.generateState(rowCount, columnCount, mineCount, [y, x]);
              ui.enableCheatButton();
            }

            const cell = Game.state.cells[y][x];
            if (!cell.visited) {
              // Left mouse button released
              if (event.which == 1) {
                if (!cell.marked) {
                  if (cell.hasMine || cell.value > 0) {
                    Game.visitCell(td, cell, true, true);
                  } else {
                    const coordinates = Game.state.calculateCoordinatesToVisit(y, x);
                    coordinates.forEach((coordinate) => {
                      const [currentY, currentX] = coordinate;
                      const currentCell = Game.state.cells[currentY][currentX];
                      if (!currentCell.visited) {
                        const td = $(`#cell-${currentY}-${currentX}`);
                        Game.visitCell(td, currentCell, false, true);
                      }
                    });
                  }

                  // Game over
                  if (cell.hasMine) {
                    Game.visitField();
                  } else {
                    Game.validateField(false);
                  }
                }
              }

              // Right mouse button released
              else if (event.which == 3) {
                Game.markUnmarkCell(td, cell, true);
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
        if (Game.state == null) {
          cells[x].addClass("cell");
        } else {
          const cell = Game.state.cells[y][x];
          if (cell.visited) {
            Game.visitCell(cells[x], cell, false, false);
          } else {
            cells[x].addClass("cell");
            if (cell.marked) {
              Game.markUnmarkCell(cells[x], cell, false);
            }
          }
        }
        rows[y].append(cells[x]);
      }
      field.append(rows[y]);
    }
    prepareField();
  }

  static resetField() {
    ui.disableCheatButton();
    ui.setTitle("Minesweeper");

    // Remove current state
    Game.state = null;

    // Regenerate field
    ui.getField().empty();
    Game.createField();
  }

  static visitField() {
    ui.disableCheatButton();
    ui.setTitle("Game Over");

    Game.state.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell.visited) {
          const td = $(`#cell-${y}-${x}`);
          Game.visitCell(td, cell, false, true);
        }
      });
    });
  }

  static validateField(shouldVisitField) {
    if (Game.state.isValid) {
      ui.disableCheatButton();
      ui.setTitle("Victory!");

      $(".cell").each((_, element) => {
        const td = $(element);
        const cell = Game.resolveCell(td);
        if (!cell.marked) {
          Game.markUnmarkCell(td, cell, true);
        }
        td.unbind();
      });
    } else if (shouldVisitField) Game.visitField();
  }

  static revealField() {
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

    Game.state.mineCoordinates.forEach((mineCoordinate) => {
      const [y, x] = mineCoordinate;
      const cell = Game.state.cells[y][x];
      if (!cell.visited) {
        const td = $(`#cell-${y}-${x}`);
        revealCell(td, cell);
      }
    });
  }

  static visitCell(td, cell, hasExploded, shouldChangeState) {
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

  static markUnmarkCell(td, cell, shouldChangeState) {
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

  static resolveCoordinates(td) {
    const y = parseInt(td.attr("data-row"));
    const x = parseInt(td.attr("data-column"));
    return [y, x];
  }

  static resolveCell(td) {
    const [y, x] = Game.resolveCoordinates(td);
    return Game.state != null ? Game.state.cells[y][x] : null;
  }
}
