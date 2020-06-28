import {State} from './state.js'
import {Cookies} from './cookies.js'
import {Controls} from './controls.js'

export class Game {

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
        case 1:  return '#09c'
        case 2:  return '#3c3'
        case 3:  return '#f30'
        case 4:  return '#039'
        case 5:  return '#900'
        case 6:  return '#099'
        case 7:  return '#c39'
        default: return '#000'
      }
    }

    td.unbind('mouseenter mouseleave mouseup').empty()
    if (cell.hasMine) {
      if (hasExploded) {
        td.removeClass().addClass('cell-mine-exploded')
      } else {
        td.removeClass().addClass('cell-mine-visited')
      }
      td.append('<div class="mine"></div>')
    } else {
      td.removeClass().addClass('cell-visited')
      if (cell.value > 0) {
        td.css('color', getCellColor(cell.value)).text(cell.value)
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

  static createField() {
    let rowCount, columnCount, mineCount

    const loadStateOrFieldParameters = () => {
      Game.state = Cookies.loadState()
      if (Game.state != null) {
        Cookies.clearState()
        Cookies.clearLevel()

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
          Controls.notification = 'Custom config, eh?'
        }
      } else {

        // Restore level if possible
        const level = Cookies.loadLevel()
        if (level != null) {
          Cookies.clearLevel()
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
            Controls.enableButtons()
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
                      const td = $('#cell-' + currentY + '-' + currentX)
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

      // Disable selection
      $.support.selectstart = 'onselectstart' in document.createElement('div')
      $('body').bind(($.support.selectstart ? 'selectstart' : 'mousedown') + '.ui-disableSelection', () => false)

      // Disable context menu
      $('#field').bind('contextmenu', () => false)

      // Adjust bars
      Controls.notificationBar.attr('colspan', columnCount)
      Controls.mineCountBar.attr('colspan', columnCount - 1)

      // Set frame size if located in iframe
      if (self != top) {
        parent.setFrameSize($('#minesweeper').outerWidth(true) + 'px', $('#minesweeper').outerHeight(true) + 'px')
      }
    }

    loadStateOrFieldParameters()
    Controls.mineCount = mineCount

    const field = $('#field')
    const rows = Array(rowCount)
    const cells = Array(columnCount)

    for (const y of rows.keys()) {
      rows[y] = $('<tr></tr>')
      for (const x of cells.keys()) {
        cells[x] = $('<td></td>')
        cells[x].attr('id', 'cell-' + y + '-' + x)
        cells[x].attr('data-row', y)
        cells[x].attr('data-column', x)

        // Restore field state
        if (Game.state == null) {
          Controls.disableButtons()
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
    Controls.notification = 'Minesweeper'

    // Remove current state
    Game.state = null

    // Regenerate field
    $('#field').empty()
    Game.createField()
  }

  static visitField() {
    Controls.disableButtons()
    Controls.notification = 'Game over'

    Game.state.cells.forEach((row, y) => {
      row.forEach((cell, x) => { 
        if (!cell.visited) {
          const td = $('#cell-' + y + '-' + x)
          Game.visitCell(td, cell, false, true)
        }
      })
    })
  }

  static validateField(shouldVisitField) {
    if (Game.state.isValid) {
      Controls.disableButtons()
      Controls.notification = 'Congrats, you won!'

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
    Controls.notification = 'You, cheater!'

    const revealCell = (td, cell) => {
      if (cell.hasMine) {
        if (cell.marked) {
          cell.marked = false
          Controls.mineCount++
        }
        td.empty().append('<div class="mine mine-small-white"></div>')
      }
    }

    Game.state.mineCoordinates.forEach(mineCoordinate => {
      const y = mineCoordinate[0]
      const x = mineCoordinate[1]
      const cell = Game.state.cells[y][x]
      if (!cell.visited) {
        const td = $('#cell-' + y + '-' + x)
        revealCell(td, cell)
      }
    })
  }
}
