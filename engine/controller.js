// Disable selection
$.support.selectstart = 'onselectstart' in document.createElement('div')
$.fn.disableSelection = function() {
  return this.bind(($.support.selectstart ? 'selectstart' : 'mousedown') +
    '.ui-disableSelection', event => event.preventDefault())
}

function getCellColor(value) {
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

function visitCell(td, cell, hasExploded, shouldChangeState) {
  if (shouldChangeState) {
    cell.visited = true
    if (cell.marked) {
      cell.marked = false
      setMineCount(getMineCount() + 1)
    }
  }

  td.unbind('mouseenter mouseleave mouseup').empty()
  if (cell.hasMine()) {
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

function markUnmarkCell(td, cell, shouldChangeState) {
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

function revealCell(td, cell) {
  if (cell.hasMine()) {
    if (cell.marked) {
      cell.marked = false
      setMineCount(getMineCount() + 1)
    }
    td.empty().append('<div class="mine mine-small-white"></div>')
  }
}

function setParameters() {
  if (state != null) {
    rowCount = state.rowCount
    columnCount = state.columnCount
    mineCount = state.mineCount

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
    const level = loadLevel()
    if (level != null) {
      clearLevel()
      setLevel(level)
    }
    const radioButton = getCheckedLevelRadioButton()
    rowCount = parseInt(radioButton.attr('data-row-count'))
    columnCount = parseInt(radioButton.attr('data-column-count'))
    mineCount = parseInt(radioButton.attr('data-mine-count'))
  }
}

function prepareField() {

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
      if (state == null) {
        state = State.generateState(rowCount, columnCount, mineCount, [y, x])
        enableButtons()
      }

      const cell = state.cells[y][x]
      if (!cell.visited) {

        // Left mouse button clicked
        if (event.which == 1) {
          if (!cell.marked) {
            if (cell.hasMine() || cell.value > 0) {
              visitCell($(element), cell, true, true)
            } else {
              const coordinates = state.calculateCoordinatesToVisit(y, x)
              coordinates.forEach(coordinate => {
                const currentY = coordinate[0]
                const currentX = coordinate[1]
                const currentCell = state.cells[currentY][currentX]
                if (!currentCell.visited) {
                  const td = $('#cell-' + currentY + '-' + currentX)
                  visitCell(td, currentCell, false, true)
                }
              })
            }

            // Game over
            if (cell.hasMine()) visitField()
            else validateField(false)
          }
        }

        // Right mouse button clicked
        else {
          markUnmarkCell($(element), cell, true)
        }
      }
    })
  })

  // Disable selection
  $('body').disableSelection()

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

function createField() {
  if (!loadGame()) disableButtons()

  setParameters()
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
      if (state == null) {
        cells[x].addClass('cell')
      } else {
        const cell = state.cells[y][x]
        if (cell.visited) {
          visitCell(cells[x], cell, false, false)
        } else {
          cells[x].addClass('cell')
          if (cell.marked) {
            markUnmarkCell(cells[x], cell, false)
          }
        }
      }
      rows[y].append(cells[x])
    }
    field.append(rows[y])
  }
  prepareField()
}

function resetField() {
  setNotification('Minesweeper')

  // Remove current state
  state = null

  // Regenerate field
  $('#field').empty()
  createField()
}

function visitField() {
  disableButtons()
  setNotification('Game over')

  state.cells.forEach((row, y) => {
    row.forEach((cell, x) => { 
      if (!cell.visited) {
        const td = $('#cell-' + y + '-' + x)
        visitCell(td, cell, false, true)
      }
    })
  })
}

function validateField(shouldVisitField) {
  if (state.isValid()) {
    disableButtons()
    setNotification('Congrats, you won!')

    $('.cell').each((index, element) => {
      const y = parseInt($(element).attr('data-row'))
      const x = parseInt($(element).attr('data-column'))
      const cell = state.cells[y][x]
      if (!cell.marked) {
        markUnmarkCell($(element), cell, true)
      }
      $(element).unbind('mouseenter mouseleave mouseup')
    })
  } else if (shouldVisitField) visitField()
}

function revealField() {
  setNotification('You, cheater!')

  state.mineCoordinates.forEach(mineCoordinate => {
    const y = mineCoordinate[0]
    const x = mineCoordinate[1]
    const cell = state.cells[y][x]
    if (!cell.visited) {
      const td = $('#cell-' + y + '-' + x)
      revealCell(td, cell)
    }
  })
}
