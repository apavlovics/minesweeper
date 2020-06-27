const STATE_SEPARATOR = ';'
const MINE_COORDINATES_SEPARATOR = ','

class State {

  constructor(cells, mineCoordinates) {
    this.cells = cells
    this.rowCount = cells.length
    this.columnCount = cells[0].length

    this.mineCoordinates = mineCoordinates
    this.mineCount = mineCoordinates.length
  }

  isVisited() {
    return !this.cells.some(row => row.some(cell => !cell.visited))
  }

  isValid() {
    return !this.cells.some(row => row.some(cell => cell.hasMine() == cell.visited))
  }

  addNeighborCoordinates(coordinates, index) {
    const y = coordinates[index][0]
    const x = coordinates[index][1]

    function addCoordinate(coordinates, coordinate) {
      if (!State.contains(coordinates, coordinate)) {
        coordinates[coordinates.length] = coordinate
      }
    }

    if (this.cells[y][x].value == 0) {
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

  calculateCoordinatesToVisit(y, x) {
    const coordinates = Array()
    if (this.cells[y][x].value == 0) {
      let i = 0
      coordinates[i] = [y, x]
      while (i < coordinates.length) {
        this.addNeighborCoordinates(coordinates, i++)
      }
    } else {
      coordinates[0] = [y, x]
    }
    return coordinates
  }

  toString() {
    let string = this.rowCount + STATE_SEPARATOR + this.columnCount + STATE_SEPARATOR
    this.cells.forEach(row => {
      row.forEach(cell => string += cell.toString() + STATE_SEPARATOR)
    })
    string += this.mineCount + STATE_SEPARATOR + this.mineCoordinates
    return string
  }

  static fromString(string) {
    const attributes = string.split(STATE_SEPARATOR)
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

    const mineCoordinatesArray = attributes[index++].split(MINE_COORDINATES_SEPARATOR)
    if (mineCoordinatesArray.length / 2 != mineCount) {
      throw 'Mine coordinate count is not valid: should be ' + mineCount
    }

    let coordinateY, coordinateX
    const mineCoordinates = Array()
    mineCoordinatesArray.forEach((coordinate, index) => {
      if (index % 2 == 0) {
        coordinateY = coordinate
      } else {
        coordinateX = coordinate
        mineCoordinates[mineCoordinates.length] = [coordinateY, coordinateX]
      }
    })
    return new State(cells, mineCoordinates)
  }

  // Coordinate must be an array of two elements
  static contains(coordinates, coordinate) {
    return coordinates.some(c => c[0] == coordinate[0] && c[1] == coordinate[1])
  }

  static generateState(rowCount, columnCount, mineCount, baseCoordinates) {

    // Generate mine positions
    let mineRow, mineColumn
    const mineCoordinates = Array(mineCount + 1)
    mineCoordinates[0] = baseCoordinates

    for (let i = 0; i < mineCount; i++) {
      do {
        mineRow = Math.floor(Math.random() * rowCount)
        mineColumn = Math.floor(Math.random() * columnCount)
      }
      while (State.contains(mineCoordinates, [mineRow, mineColumn]))
      mineCoordinates[i + 1] = [mineRow, mineColumn]
    }
    mineCoordinates.splice(0, 1)

    function countNeighborMines(mineCoordinates, y, x) {
      let mineCount = 0
      if (State.contains(mineCoordinates, [y - 1, x])) mineCount++
      if (State.contains(mineCoordinates, [y + 1, x])) mineCount++

      if (State.contains(mineCoordinates, [y, x - 1])) mineCount++
      if (State.contains(mineCoordinates, [y, x + 1])) mineCount++

      if (State.contains(mineCoordinates, [y - 1, x - 1])) mineCount++
      if (State.contains(mineCoordinates, [y + 1, x + 1])) mineCount++

      if (State.contains(mineCoordinates, [y - 1, x + 1])) mineCount++
      if (State.contains(mineCoordinates, [y + 1, x - 1])) mineCount++
      return mineCount
    }

    // Generate state
    const cells = Array(rowCount)
    for (const y of cells.keys()) {
      const row = Array(columnCount)
      for (const x of row.keys()) {
        if (State.contains(mineCoordinates, [y, x])) {
          row[x] = new Cell('M', false, false)
        } else {
          row[x] = new Cell(countNeighborMines(mineCoordinates, y, x), false, false)
        }
      }
      cells[y] = row
    }
    return new State(cells, mineCoordinates)
  }
}
