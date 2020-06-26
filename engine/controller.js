// Disable selection
$.support.selectstart = 'onselectstart' in document.createElement('div')
$.fn.disableSelection = function() {
  return this.bind(($.support.selectstart ? 'selectstart' : 'mousedown') +
    '.ui-disableSelection', function(event) {
      event.preventDefault()
    })
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

    var wasChecked = false
    getLevelRadioButtons().each(
      function() {
        if ($(this).attr('data-row-count') == rowCount &&
            $(this).attr('data-column-count') == columnCount &&
            $(this).attr('data-mine-count') == mineCount) {
            $(this).attr('checked', true)
          wasChecked = true
          return false
        }
      }
    )
    if (!wasChecked) {
      setNotification('Custom config, eh?')
    }
  } else {

    // Restore level if possible
    var level = loadLevel()
    if (level != null) {
      clearLevel()
      setLevel(level)
    }
    var radioButton = getCheckedLevelRadioButton()
    rowCount = radioButton.attr('data-row-count')
    columnCount = radioButton.attr('data-column-count')
    mineCount = radioButton.attr('data-mine-count')
  }
}

function prepareField() {

  // Add hover to cells
  $(function() {
    $('.cell').hover(function() {
      $(this).removeClass().addClass('cell-hover')
    }, function() {
      $(this).removeClass().addClass('cell')
    })
  })

  // Add click to cells
  $(function() {
    $('.cell').mouseup(function(event) {
      var y = parseInt($(this).attr('data-row'))
      var x = parseInt($(this).attr('data-column'))

      // Generate new state if needed
      if (state == null) {
        state = State.generateState(rowCount, columnCount, mineCount, [y, x])
        enableButtons()
      }

      var cell = state.cells[y][x]
      if (!cell.visited) {

        // Left mouse button clicked
        if (event.which == 1) {
          if (!cell.marked) {
            if (cell.hasMine() || cell.value > 0) {
              visitCell($(this), cell, true, true)
            } else {
              var coordinates = state.calculateCoordinatesToVisit(y, x)
              for (var i = 0; i < coordinates.length; i++) {
                var currentY = coordinates[i][0]
                var currentX = coordinates[i][1]
                var currentCell = state.cells[currentY][currentX]
                if (!currentCell.visited) {
                  var td = $('#cell-' + currentY + '-' + currentX)
                  visitCell(td, currentCell, false, true)
                }
              }
            }

            // Game over
            if (cell.hasMine()) visitField()
            else validateField(false)
          }
        }

        // Right mouse button clicked
        else {
          markUnmarkCell($(this), cell, true)
        }
      }
    })
  })

  // Disable selection
  $('body').disableSelection()

  // Disable context menu
  $('#field').bind('contextmenu', function(e) {
    return false
  })

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

  var field = $('#field')
  var rows = new Array(rowCount)
  var cells = new Array(columnCount)

  for (var y = 0; y < rowCount; y++) {
    rows[y] = $('<tr></tr>')
    for (var x = 0; x < columnCount; x++) {
      cells[x] = $('<td></td>')
      cells[x].attr('id', 'cell-' + y + '-' + x)
      cells[x].attr('data-row', y)
      cells[x].attr('data-column', x)

      // Restore field state
      if (state == null) {
        cells[x].addClass('cell')
      } else {
        var cell = state.cells[y][x]
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

  for (var y = 0; y < state.rowCount; y++) {
    for (var x = 0; x < state.columnCount; x++) {
      var cell = state.cells[y][x]
      if (!cell.visited) {
        var td = $('#cell-' + y + '-' + x)
        visitCell(td, cell, false, true)
      }
    }
  }
}

function validateField(shouldVisitField) {
  if (state.isValid()) {
    disableButtons()
    setNotification('Congrats, you won!')

    $('.cell').each(
      function() {
        var y = parseInt($(this).attr('data-row'))
        var x = parseInt($(this).attr('data-column'))
        var cell = state.cells[y][x]
        if (!cell.marked) {
          markUnmarkCell($(this), cell, true)
        }
        $(this).unbind('mouseenter mouseleave mouseup')
      }
    )
  } else if (shouldVisitField) visitField()
}

function revealField() {
  setNotification('You, cheater!')

  for (var i = 0; i < state.mineCoordinates.length; i++) {
    var y = state.mineCoordinates[i][0]
    var x = state.mineCoordinates[i][1]
    var cell = state.cells[y][x]
    if (!cell.visited) {
      var td = $('#cell-' + y + '-' + x)
      revealCell(td, cell)
    }
  }
}
