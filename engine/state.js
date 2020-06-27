// Coordinate must be an array of two elements
function contains(coordinates, coordinate) {
  return coordinates.some(c => c[0] == coordinate[0] && c[1] == coordinate[1])
}

function State(cells, mineCoordinates) {
  this.cells = cells
  this.rowCount = cells.length
  this.columnCount = cells[0].length

  this.mineCoordinates = mineCoordinates
  this.mineCount = mineCoordinates.length

  this.isVisited = function() {
    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.columnCount; x++) {
        const cell = this.cells[y][x]
        if (!cell.visited) return false
      }
    }
    return true
  }

  this.isValid = function() {
    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.columnCount; x++) {
        const cell = this.cells[y][x]
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

  const self = this

  function addNeighborCoordinates(coordinates, index) {
    const y = coordinates[index][0]
    const x = coordinates[index][1]

    if (self.cells[y][x].value == 0) {
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
    const coordinates = Array()
    if (this.cells[y][x].value == 0) {
      let i = 0
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
  let string = this.rowCount + State.STATE_SEPARATOR + this.columnCount + State.STATE_SEPARATOR
  for (let y = 0; y < this.rowCount; y++) {
    for (let x = 0; x < this.columnCount; x++) {
      const cell = this.cells[y][x]
      string += cell.toString() + State.STATE_SEPARATOR
    }
  }
  string += this.mineCount + State.STATE_SEPARATOR + this.mineCoordinates
  return string
}

State.fromString = function(string) {
  const attributes = string.split(State.STATE_SEPARATOR)

  if (attributes.length < 5) {
    throw 'State attribute count is not valid'
  }

  let index = 0
  const rowCount = parseInt(attributes[index++])
  const columnCount = parseInt(attributes[index++])

  const cells = Array(rowCount)
  for (const y of cells.keys()) {
    const row = Array(columnCount)
    for (const x of row.keys()) {
      row[x] = Cell.fromString(attributes[index++])
    }
    cells[y] = row
  }

  const mineCount = parseInt(attributes[index++])

  const mineCoordinatesArray = attributes[index++].split(State.MINE_COORDINATES_SEPARATOR)
  if (mineCoordinatesArray.length / 2 != mineCount) {
    throw 'Mine coordinate count is not valid: should be ' + mineCount
  }

  let isY = true
  let coordinateY, coordinateX
  const mineCoordinates = Array()
  for (const i of mineCoordinatesArray.keys()) {
    if (isY) {
      coordinateY = mineCoordinatesArray[i]
    } else {
      coordinateX = mineCoordinatesArray[i]
      mineCoordinates[mineCoordinates.length] = [coordinateY, coordinateX]
    }
    isY = !isY
  }

  return new State(cells, mineCoordinates)
}

State.generateState = function(rowCount, columnCount, mineCount, baseCoordinates) {

  // Generate mine positions
  let mineRow, mineColumn
  const mineCoordinates = Array(mineCount + 1)
  mineCoordinates[0] = baseCoordinates

  for (let i = 0; i < mineCount; i++) {
    do {
      mineRow = Math.floor(Math.random() * rowCount)
      mineColumn = Math.floor(Math.random() * columnCount)
    }
    while (contains(mineCoordinates, [mineRow, mineColumn]))
    mineCoordinates[i + 1] = [mineRow, mineColumn]
  }
  mineCoordinates.splice(0, 1)

  function countNeighborMines(mineCoordinates, y, x) {
    let mineCount = 0
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
  const cells = Array(rowCount)
  for (const y of cells.keys()) {
    const row = Array(columnCount)
    for (const x of row.keys()) {
      if (contains(mineCoordinates, [y, x])) {
        row[x] = new Cell('M', false, false)
      } else {
        row[x] = new Cell(countNeighborMines(mineCoordinates, y, x), false, false)
      }
    }
    cells[y] = row
  }
  return new State(cells, mineCoordinates)
}
