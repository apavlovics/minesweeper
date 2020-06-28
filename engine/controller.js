class Controller {

  static visitCell(td, cell, hasExploded, shouldChangeState) {
    if (shouldChangeState) {
      cell.visited = true
      if (cell.marked) {
        cell.marked = false
        setMineCount(getMineCount() + 1)
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
      setMineCount(getMineCount() - 1)
    } else {
      setMineCount(getMineCount() + 1)
    }
  }

  static createField() {
    let rowCount, columnCount, mineCount

    const determineFieldParameters = () => {
      Controller.state = Cookies.loadState()
      if (Controller.state != null) {
        Cookies.clearState()
        Cookies.clearLevel()

        rowCount = Controller.state.rowCount
        columnCount = Controller.state.columnCount
        mineCount = Controller.state.mineCount

        let wasChecked = false
        getLevelRadioButtons().each((index, element) => {
          if ($(element).attr('data-row-count') == rowCount &&
              $(element).attr('data-column-count') == columnCount &&
              $(element).attr('data-mine-count') == mineCount) {
            $(element).attr('checked', true)
            wasChecked = true
          }
        })
        if (!wasChecked) {
          setNotification('Custom config, eh?')
        }
      } else {

        // Restore level if possible
        const level = Cookies.loadLevel()
        if (level != null) {
          Cookies.clearLevel()
          setLevel(level)
        }
        const radioButton = getCheckedLevelRadioButton()
        rowCount = parseInt(radioButton.attr('data-row-count'))
        columnCount = parseInt(radioButton.attr('data-column-count'))
        mineCount = parseInt(radioButton.attr('data-mine-count'))
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
          if (Controller.state == null) {
            Controller.state = State.generateState(rowCount, columnCount, mineCount, [y, x])
            enableButtons()
          }

          const cell = Controller.state.cells[y][x]
          if (!cell.visited) {

            // Left mouse button clicked
            if (event.which == 1) {
              if (!cell.marked) {
                if (cell.hasMine || cell.value > 0) {
                  Controller.visitCell($(element), cell, true, true)
                } else {
                  const coordinates = Controller.state.calculateCoordinatesToVisit(y, x)
                  coordinates.forEach(coordinate => {
                    const currentY = coordinate[0]
                    const currentX = coordinate[1]
                    const currentCell = Controller.state.cells[currentY][currentX]
                    if (!currentCell.visited) {
                      const td = $('#cell-' + currentY + '-' + currentX)
                      Controller.visitCell(td, currentCell, false, true)
                    }
                  })
                }

                // Game over
                if (cell.hasMine) {
                  Controller.visitField()
                } else {
                  Controller.validateField(false)
                }
              }
            }

            // Right mouse button clicked
            else {
              Controller.markUnmarkCell($(element), cell, true)
            }
          }
        })
      })

      // Disable selection
      $.support.selectstart = 'onselectstart' in document.createElement('div')
      $('body').bind(($.support.selectstart ? 'selectstart' : 'mousedown') + '.ui-disableSelection', event => false)

      // Disable context menu
      $('#field').bind('contextmenu', event => false)

      // Adjust bars
      getNotificationBar().attr('colspan', columnCount)
      getMineCountBar().attr('colspan', columnCount - 1)

      // Set frame size if located in iframe
      if (self != top) {
        parent.setFrameSize($('#minesweeper').outerWidth(true) + 'px', $('#minesweeper').outerHeight(true) + 'px')
      }
    }

    determineFieldParameters()
    setMineCount(mineCount)

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
        if (Controller.state == null) {
          disableButtons()
          cells[x].addClass('cell')
        } else {
          const cell = Controller.state.cells[y][x]
          if (cell.visited) {
            Controller.visitCell(cells[x], cell, false, false)
          } else {
            cells[x].addClass('cell')
            if (cell.marked) {
              Controller.markUnmarkCell(cells[x], cell, false)
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
    setNotification('Minesweeper')

    // Remove current state
    Controller.state = null

    // Regenerate field
    $('#field').empty()
    Controller.createField()
  }

  static visitField() {
    disableButtons()
    setNotification('Game over')

    Controller.state.cells.forEach((row, y) => {
      row.forEach((cell, x) => { 
        if (!cell.visited) {
          const td = $('#cell-' + y + '-' + x)
          Controller.visitCell(td, cell, false, true)
        }
      })
    })
  }

  static validateField(shouldVisitField) {
    if (Controller.state.isValid) {
      disableButtons()
      setNotification('Congrats, you won!')

      $('.cell').each((index, element) => {
        const y = parseInt($(element).attr('data-row'))
        const x = parseInt($(element).attr('data-column'))
        const cell = Controller.state.cells[y][x]
        if (!cell.marked) {
          Controller.markUnmarkCell($(element), cell, true)
        }
        $(element).unbind('mouseenter mouseleave mouseup')
      })
    } else if (shouldVisitField) Controller.visitField()
  }

  static revealField() {
    setNotification('You, cheater!')

    const revealCell = (td, cell) => {
      if (cell.hasMine) {
        if (cell.marked) {
          cell.marked = false
          setMineCount(getMineCount() + 1)
        }
        td.empty().append('<div class="mine mine-small-white"></div>')
      }
    }

    Controller.state.mineCoordinates.forEach(mineCoordinate => {
      const y = mineCoordinate[0]
      const x = mineCoordinate[1]
      const cell = Controller.state.cells[y][x]
      if (!cell.visited) {
        const td = $('#cell-' + y + '-' + x)
        revealCell(td, cell)
      }
    })
  }
}
