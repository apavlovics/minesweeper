// Coordinate must be an array of two elements
function contains(coordinates, coordinate) {
  for (var i = 0; i < coordinates.length; i++) {
    if (coordinates[i][0] == coordinate[0]
        && coordinates[i][1] == coordinate[1]) {
      return true
    }
  }
  return false
}

function State(cells, mineCoordinates) {
  this.cells = cells
  this.rowCount = cells.length
  this.columnCount = cells[0].length

  this.mineCoordinates = mineCoordinates
  this.mineCount = mineCoordinates.length

  var that = this

  this.isVisited = function() {
    for (var y = 0; y < this.rowCount; y++) {
      for (var x = 0; x < this.columnCount; x++) {
        var cell = this.cells[y][x]
        if (!cell.visited) return false
      }
    }
    return true
  }

  this.isValid = function() {
    for (var y = 0; y < this.rowCount; y++) {
      for (var x = 0; x < this.columnCount; x++) {
        var cell = this.cells[y][x]
        if (cell.hasMine() == cell.visited) return false
      }
    }
    return true
  }

  function addCoordinate(coordinates, coordinate) {
    if (!contains(coordinates, coordinate)) {
      coordinates[coordinates.length] = coordinate
    }
  }

  function addNeighborCoordinates(coordinates, index) {
    var y = coordinates[index][0]
    var x = coordinates[index][1]

    if (that.cells[y][x].value == 0) {
      if (y > 0)
        addCoordinate(coordinates, [y - 1, x])
      if (y < this.rowCount - 1)
        addCoordinate(coordinates, [y + 1, x])

      if (x > 0)
        addCoordinate(coordinates, [y, x - 1])
      if (x < this.columnCount - 1)
        addCoordinate(coordinates, [y, x + 1])

      if (y > 0 && x > 0)
        addCoordinate(coordinates, [y - 1, x - 1])
      if (y < this.rowCount - 1 && x < this.columnCount - 1)
        addCoordinate(coordinates, [y + 1, x + 1])

      if (y > 0 && x < this.columnCount - 1)
        addCoordinate(coordinates, [y - 1, x + 1])
      if (y < this.rowCount - 1 && x > 0)
        addCoordinate(coordinates, [y + 1, x - 1])
    }
  }

  this.calculateCoordinatesToVisit = function(y, x) {
    var coordinates = new Array()
    if (this.cells[y][x].value == 0) {
      var i = 0
      coordinates[i] = [y, x]
      while (i < coordinates.length) {
        addNeighborCoordinates(coordinates, i++)
      }
    } else {
      coordinates[0] = [y, x]
    }
    return coordinates
  }
}

State.STATE_SEPARATOR = ';'
State.MINE_COORDINATES_SEPARATOR = ','

State.prototype.toString = function() {
  var string = this.rowCount + State.STATE_SEPARATOR + this.columnCount + State.STATE_SEPARATOR
  for (var y = 0; y < this.rowCount; y++) {
    for (var x = 0; x < this.columnCount; x++) {
      var cell = this.cells[y][x]
      string += cell.toString() + State.STATE_SEPARATOR
    }
  }
  string += this.mineCount + State.STATE_SEPARATOR + this.mineCoordinates
  return string
}

State.fromString = function(string) {
  var attributes = string.split(State.STATE_SEPARATOR)

  if (attributes.length < 5) {
    throw 'State attribute count is not valid'
  }

  var index = 0
  var rowCount = parseInt(attributes[index++])
  var columnCount = parseInt(attributes[index++])

  var cells = new Array(rowCount)
  var cellArray
  for (var y = 0; y < rowCount; y++) {
    var row = new Array(columnCount)
    for (var x = 0; x < columnCount; x++) {
      row[x] = Cell.fromString(attributes[index++])
    }
    cells[y] = row
  }

  var mineCount = parseInt(attributes[index++])

  var mineCoordinatesArray = attributes[index++].split(State.MINE_COORDINATES_SEPARATOR)
  if (mineCoordinatesArray.length / 2 != mineCount)
    throw 'Mine coordinate count is not valid: should be ' + mineCount

  var isY = true
  var coordinateY, coordinateX
  var mineCoordinates = new Array()
  for (var i = 0; i < mineCoordinatesArray.length; i++) {
    if (isY)
      coordinateY = mineCoordinatesArray[i]
    else {
      coordinateX = mineCoordinatesArray[i]
      mineCoordinates[mineCoordinates.length] = [coordinateY, coordinateX]
    }
    isY = !isY
  }

  return new State(cells, mineCoordinates)
}

State.generateState = function(rowCount, columnCount, mineCount, baseCoordinates) {

  // Generate mine positions
  var mineRow, mineColumn
  var mineCoordinates = new Array(mineCount + 1)
  mineCoordinates[0] = baseCoordinates

  for (var i = 0; i < mineCount; i++) {
    do {
      mineRow = Math.floor(Math.random() * rowCount)
      mineColumn = Math.floor(Math.random() * columnCount)
    }
    while (contains(mineCoordinates, [mineRow, mineColumn]))
    mineCoordinates[i + 1] = [mineRow, mineColumn]
  }
  mineCoordinates.splice(0, 1)

  function countNeighborMines(mineCoordinates, y, x) {
    var mineCount = 0
    if (contains(mineCoordinates, [y - 1, x])) mineCount++
    if (contains(mineCoordinates, [y + 1, x])) mineCount++

    if (contains(mineCoordinates, [y, x - 1])) mineCount++
    if (contains(mineCoordinates, [y, x + 1])) mineCount++

    if (contains(mineCoordinates, [y - 1, x - 1])) mineCount++
    if (contains(mineCoordinates, [y + 1, x + 1])) mineCount++

    if (contains(mineCoordinates, [y - 1, x + 1])) mineCount++
    if (contains(mineCoordinates, [y + 1, x - 1])) mineCount++
    return mineCount
  }

  // Generate state
  var cells = new Array(rowCount)
  for (var y = 0; y < rowCount; y++) {
    var row = new Array(columnCount)
    for (var x = 0; x < columnCount; x++) {
      if (contains(mineCoordinates, [y, x]))
        row[x] = new Cell('M', false, false)
      else
        row[x] = new Cell(countNeighborMines(mineCoordinates, y, x), false, false)
    }
    cells[y] = row
  }
  return new State(cells, mineCoordinates)
}
