import {State} from './state.js'
import {CookieManager} from './cookie-manager.js'
import {Controls} from './controls.js'

export class Game {

  static initialize() {
    window.Game = Game
    $(document).ready(() => {
      Controls.minesweeper.append(`
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
          <button id="new-game" onclick="Game.resetField()">New Game</button><br>
          <button id="cheat" onclick="Game.revealField()" disabled>Cheat</button><br>
        </div>
        <div>
          <h2 id="title">Minesweeper</h2>
          <table id="field"></table>
          <div id="mine-count-bar">
            <div class="mine"></div>
            <div id="mine-count"></div>
          </div>
        </div>`)
      Game.createField()
    })
    $(window).on('unload', () => {
      CookieManager.saveState(Game.state)
      CookieManager.saveLevel(Controls.level)
    })
  }

  static createField() {
    let rowCount, columnCount, mineCount

    const loadStateOrFieldParameters = () => {
      Game.state = CookieManager.loadState()
      if (Game.state != null) {
        CookieManager.clearState()
        CookieManager.clearLevel()

        rowCount = Game.state.rowCount
        columnCount = Game.state.columnCount
        mineCount = Game.state.mineCount

        let wasChecked = false
        Controls.levelRadioButtons.each((index, element) => {
          if ($(element).attr('data-row-count') == rowCount &&
              $(element).attr('data-column-count') == columnCount &&
              $(element).attr('data-mine-count') == mineCount) {
            $(element).attr('checked', true)
            wasChecked = true
          }
        })
        if (!wasChecked) {
          Controls.title = 'Custom config, eh?'
        }
        Controls.enableCheatButton()
      } else {

        // Restore level if possible
        const level = CookieManager.loadLevel()
        if (level != null) {
          CookieManager.clearLevel()
          Controls.level = level
        }
        const button = Controls.checkedLevelRadioButton
        rowCount = parseInt(button.attr('data-row-count'))
        columnCount = parseInt(button.attr('data-column-count'))
        mineCount = parseInt(button.attr('data-mine-count'))
      }
    }

    const prepareField = () => {

      // Add hover to cells
      $(() => {
        $('.cell').hover(event => {
          $(event.currentTarget).removeClass().addClass('cell-hover')
        }, event => {
          $(event.currentTarget).removeClass().addClass('cell')
        })
      })

      // Add click to cells
      $(() => {
        $('.cell').mouseup(event => {
          const element = event.currentTarget
          const y = parseInt($(element).attr('data-row'))
          const x = parseInt($(element).attr('data-column'))

          // Generate new state if needed
          if (Game.state == null) {
            Game.state = State.generateState(rowCount, columnCount, mineCount, [y, x])
            Controls.enableCheatButton()
          }

          const cell = Game.state.cells[y][x]
          if (!cell.visited) {

            // Left mouse button clicked
            if (event.which == 1) {
              if (!cell.marked) {
                if (cell.hasMine || cell.value > 0) {
                  Game.visitCell($(element), cell, true, true)
                } else {
                  const coordinates = Game.state.calculateCoordinatesToVisit(y, x)
                  coordinates.forEach(coordinate => {
                    const currentY = coordinate[0]
                    const currentX = coordinate[1]
                    const currentCell = Game.state.cells[currentY][currentX]
                    if (!currentCell.visited) {
                      const td = $(`#cell-${currentY}-${currentX}`)
                      Game.visitCell(td, currentCell, false, true)
                    }
                  })
                }

                // Game over
                if (cell.hasMine) {
                  Game.visitField()
                } else {
                  Game.validateField(false)
                }
              }
            }

            // Right mouse button clicked
            else {
              Game.markUnmarkCell($(element), cell, true)
            }
          }
        })
      })

      // Disable context menu
      Controls.field.bind('contextmenu', () => false)

      // Set frame size if located in iframe
      if (self != top) {
        const minesweeper = Controls.minesweeper
        parent.setFrameSize(`${minesweeper.outerWidth(true)}px`, `${minesweeper.outerHeight(true)}px`)
      }
    }

    loadStateOrFieldParameters()
    Controls.mineCount = mineCount

    const field = Controls.field
    const rows = Array(rowCount)
    const cells = Array(columnCount)

    for (const y of rows.keys()) {
      rows[y] = $('<tr></tr>')
      for (const x of cells.keys()) {
        cells[x] = $('<td></td>')
        cells[x].attr('id', `cell-${y}-${x}`)
        cells[x].attr('data-row', y)
        cells[x].attr('data-column', x)

        // Restore field state
        if (Game.state == null) {
          cells[x].addClass('cell')
        } else {
          const cell = Game.state.cells[y][x]
          if (cell.visited) {
            Game.visitCell(cells[x], cell, false, false)
          } else {
            cells[x].addClass('cell')
            if (cell.marked) {
              Game.markUnmarkCell(cells[x], cell, false)
            }
          }
        }
        rows[y].append(cells[x])
      }
      field.append(rows[y])
    }
    prepareField()
  }

  static resetField() {
    Controls.disableCheatButton()
    Controls.title = 'Minesweeper'

    // Remove current state
    Game.state = null

    // Regenerate field
    Controls.field.empty()
    Game.createField()
  }

  static visitField() {
    Controls.disableCheatButton()
    Controls.title = 'Game Over'

    Game.state.cells.forEach((row, y) => {
      row.forEach((cell, x) => { 
        if (!cell.visited) {
          const td = $(`#cell-${y}-${x}`)
          Game.visitCell(td, cell, false, true)
        }
      })
    })
  }

  static validateField(shouldVisitField) {
    if (Game.state.isValid) {
      Controls.disableCheatButton()
      Controls.title = 'Victory!'

      $('.cell').each((index, element) => {
        const y = parseInt($(element).attr('data-row'))
        const x = parseInt($(element).attr('data-column'))
        const cell = Game.state.cells[y][x]
        if (!cell.marked) {
          Game.markUnmarkCell($(element), cell, true)
        }
        $(element).unbind('mouseenter mouseleave mouseup')
      })
    } else if (shouldVisitField) Game.visitField()
  }

  static revealField() {
    Controls.title = 'Cheater!'

    const revealCell = (td, cell) => {
      if (cell.hasMine) {
        if (cell.marked) {
          cell.marked = false
          Controls.mineCount++
        }
        td.empty().append('<div class="mine-revealed"></div>')
      }
    }

    Game.state.mineCoordinates.forEach(mineCoordinate => {
      const y = mineCoordinate[0]
      const x = mineCoordinate[1]
      const cell = Game.state.cells[y][x]
      if (!cell.visited) {
        const td = $(`#cell-${y}-${x}`)
        revealCell(td, cell)
      }
    })
  }

  static visitCell(td, cell, hasExploded, shouldChangeState) {
    if (shouldChangeState) {
      cell.visited = true
      if (cell.marked) {
        cell.marked = false
        Controls.mineCount++
      }
    }

    const getCellColor = value => {
      switch (value) {
        // See :root CSS variables for color definitions
        case 1:  return 'blue'
        case 2:  return 'green'
        case 3:  return 'red'
        case 4:  return 'dark-blue'
        case 5:  return 'dark-red'
        case 6:  return 'teal'
        case 7:  return 'purple'
        default: return 'black'
      }
    }

    td.unbind('mouseenter mouseleave mouseup').empty()
    td.removeClass()
    if (cell.hasMine) {
      if (hasExploded) {
        td.addClass('cell-mine-exploded')
      } else {
        td.addClass('cell-mine-visited')
      }
      td.append('<div class="mine"></div>')
    } else {
      td.addClass('cell-visited')
      if (cell.value > 0) {
        td.css('color', `rgb(var(--${getCellColor(cell.value)}))`).text(cell.value)
      }
    }
  }

  static markUnmarkCell(td, cell, shouldChangeState) {
    if (shouldChangeState) {
      cell.marked = !cell.marked
    }

    td.empty()
    if (cell.marked) {
      td.append('<div class="flag"></div>')
      Controls.mineCount--
    } else {
      Controls.mineCount++
    }
  }
}
