import {State} from './state.js'
import {CookieManager} from './cookie-manager.js'
import {UI} from './ui.js'

export class Game {

  static initialize() {
    window.Game = Game
    $(document).ready(() => {
      UI.minesweeper.html(`
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
        </div>`)
      Game.createField()
    })
    $(window).on('unload', () => {
      CookieManager.saveState(Game.state)
      CookieManager.saveLevel(UI.level)
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
        UI.levelRadioButtons.each((index, element) => {
          const button = $(element)
          if (button.attr('data-row-count') == rowCount &&
              button.attr('data-column-count') == columnCount &&
              button.attr('data-mine-count') == mineCount) {
            button.attr('checked', true)
            wasChecked = true
          }
        })
        if (!wasChecked) {
          UI.title = 'Custom config, eh?'
        }
        UI.enableCheatButton()
      } else {

        // Restore level if possible
        const level = CookieManager.loadLevel()
        if (level != null) {
          CookieManager.clearLevel()
          UI.level = level
        }
        const button = UI.checkedLevelRadioButton
        rowCount = parseInt(button.attr('data-row-count'))
        columnCount = parseInt(button.attr('data-column-count'))
        mineCount = parseInt(button.attr('data-mine-count'))
      }
    }

    const prepareField = () => {
      $('.cell')
        // Active mode works better via JavaScript than via CSS
        .mousedown(event => {
          const td = $(event.currentTarget)
          const cell = Game.resolveCell(td)
          const marked = cell != null ? cell.marked : false
          if (!marked || event.which == 3) {
            td.removeClass('cell').addClass('cell-active')
          }
        })
        .mouseleave(event => {
          $(event.currentTarget).removeClass('cell-active').addClass('cell')
        })
        .mouseup(event => {
          const td = $(event.currentTarget)
          const [y, x] = Game.resolveCoordinates(td)
          td.removeClass('cell-active').addClass('cell')

          // Generate new state if needed
          if (Game.state == null) {
            Game.state = State.generateState(rowCount, columnCount, mineCount, [y, x])
            UI.enableCheatButton()
          }

          const cell = Game.state.cells[y][x]
          if (!cell.visited) {

            // Left mouse button clicked
            if (event.which == 1) {
              if (!cell.marked) {
                if (cell.hasMine || cell.value > 0) {
                  Game.visitCell(td, cell, true, true)
                } else {
                  const coordinates = Game.state.calculateCoordinatesToVisit(y, x)
                  coordinates.forEach(coordinate => {
                    const [currentY, currentX] = coordinate
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
            else if (event.which == 3) {
              Game.markUnmarkCell(td, cell, true)
            }
          }
        })

      // Disable context menu
      UI.field.bind('contextmenu', () => false)

      // Set frame size if located in iframe
      if (self != top) {
        const minesweeper = UI.minesweeper
        parent.setFrameSize(`${minesweeper.outerWidth(true)}px`, `${minesweeper.outerHeight(true)}px`)
      }
    }

    loadStateOrFieldParameters()
    UI.mineCount = mineCount

    const field = UI.field
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
    UI.disableCheatButton()
    UI.title = 'Minesweeper'

    // Remove current state
    Game.state = null

    // Regenerate field
    UI.field.empty()
    Game.createField()
  }

  static visitField() {
    UI.disableCheatButton()
    UI.title = 'Game Over'

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
      UI.disableCheatButton()
      UI.title = 'Victory!'

      $('.cell').each((index, element) => {
        const td = $(element)
        const cell = Game.resolveCell(td)
        if (!cell.marked) {
          Game.markUnmarkCell(td, cell, true)
        }
        td.unbind()
      })
    } else if (shouldVisitField) Game.visitField()
  }

  static revealField() {
    UI.title = 'Cheater!'

    const revealCell = (td, cell) => {
      if (cell.hasMine) {
        if (cell.marked) {
          cell.marked = false
          UI.mineCount++
        }
        td.html('<div class="mine-revealed"></div>')
      }
    }

    Game.state.mineCoordinates.forEach(mineCoordinate => {
      const [y, x] = mineCoordinate
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
        UI.mineCount++
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

    td.unbind().removeClass()
    if (cell.hasMine) {
      if (hasExploded) {
        td.addClass('cell-mine-exploded')
      } else {
        td.addClass('cell-mine-visited')
      }
      td.html('<div class="mine"></div>')
    } else {
      td.addClass('cell-visited').empty()
      if (cell.value > 0) {
        td.css('color', `rgb(var(--${getCellColor(cell.value)}))`).text(cell.value)
      }
    }
  }

  static markUnmarkCell(td, cell, shouldChangeState) {
    if (shouldChangeState) {
      cell.marked = !cell.marked
    }

    if (cell.marked) {
      td.html('<div class="flag"></div>')
      UI.mineCount--
    } else {
      td.empty()
      UI.mineCount++
    }
  }

  static resolveCoordinates(td) {
    const y = parseInt(td.attr('data-row'))
    const x = parseInt(td.attr('data-column'))
    return [y, x]
  }

  static resolveCell(td) {
    const [y, x] = Game.resolveCoordinates(td)
    return Game.state != null ? Game.state.cells[y][x] : null
  }
}
