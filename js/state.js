import {Cell} from './cell.js'

// Determine if two arrays are equal (i.e. have the same number of strictly equal elements)
Array.prototype.equals = function(other) {
  return this.length == other.length && !this.some((element, index) => element !== other[index])
}

export class State {

  constructor(cells, mineCoordinates) {
    this.cells = cells
    this.rowCount = cells.length
    this.columnCount = cells[0].length

    this.mineCoordinates = mineCoordinates
    this.mineCount = mineCoordinates.length
  }

  get isVisited() {
    return !this.cells.some(row => row.some(cell => !cell.visited))
  }

  get isValid() {
    return !this.cells.some(row => row.some(cell => cell.hasMine == cell.visited))
  }

  calculateCoordinatesToVisit(y, x) {

    const addCoordinate = (coordinates, coordinate) => {
      if (!State.contains(coordinates, coordinate)) {
        coordinates[coordinates.length] = coordinate
      }
    }

    const addNeighborCoordinates = (coordinates, index) => {
      const y = coordinates[index][0]
      const x = coordinates[index][1]
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

    const coordinates = Array()
    if (this.cells[y][x].value == 0) {
      let index = 0
      coordinates[index] = [y, x]
      while (index < coordinates.length) {
        addNeighborCoordinates(coordinates, index++)
      }
    } else {
      coordinates[0] = [y, x]
    }
    return coordinates
  }

  static get STATE_SEPARATOR() { return ';' }
  static get MINE_COORDINATES_SEPARATOR() { return ',' }

  toString() {
    let string = this.rowCount + State.STATE_SEPARATOR + this.columnCount + State.STATE_SEPARATOR
    this.cells.forEach(row => {
      row.forEach(cell => string += cell.toString() + State.STATE_SEPARATOR)
    })
    string += this.mineCount + State.STATE_SEPARATOR + this.mineCoordinates
    return string
  }

  static fromString(string) {
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

  static contains(coordinates, coordinate) {
    return coordinates.some(c => c.equals(coordinate))
  }

  static generateState(rowCount, columnCount, mineCount, baseCoordinates) {

    // Generate mine positions excluding base coordinates
    const mineCoordinates = Array(mineCount)
    for (const index of mineCoordinates.keys()) {
      const mineCoordinate = Array(2)
      do {
        mineCoordinate[0] = Math.floor(Math.random() * rowCount)
        mineCoordinate[1] = Math.floor(Math.random() * columnCount)
      } while (baseCoordinates.equals(mineCoordinate) || State.contains(mineCoordinates, mineCoordinate))
      mineCoordinates[index] = mineCoordinate
    }

    const countNeighborMines = (mineCoordinates, y, x) => {
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
