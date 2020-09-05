import {Cell} from './cell.js'

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
    const coordinates = Array()

    const addNeighborCoordinates = (index) => {
      const [y, x] = coordinates[index]
      if (this.cells[y][x].value == 0) {
        State.calculateNeighborCoordinates(y, x).forEach(coordinate => {
          const [y, x] = coordinate
          const inBounds = y >= 0 && y < this.rowCount && x >= 0 && x < this.columnCount
          if (inBounds && !State.contains(coordinates, coordinate)) {
            coordinates.push(coordinate)
          }
        })
      }
    }

    if (this.cells[y][x].value == 0) {
      let index = 0
      coordinates[index] = [y, x]
      while (index < coordinates.length) {
        addNeighborCoordinates(index++)
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
      throw `Mine coordinate count is not valid: should be ${mineCount}`
    }

    let coordinateY, coordinateX
    const mineCoordinates = Array()
    mineCoordinatesArray.forEach((coordinate, index) => {
      if (index % 2 == 0) {
        coordinateY = coordinate
      } else {
        coordinateX = coordinate
        mineCoordinates.push([coordinateY, coordinateX])
      }
    })
    return new State(cells, mineCoordinates)
  }

  static calculateNeighborCoordinates(y, x) {
    return [
        [y - 1, x],
        [y + 1, x],
        [y, x - 1],
        [y, x + 1],
        [y - 1, x - 1],
        [y + 1, x + 1],
        [y - 1, x + 1],
        [y + 1, x - 1],
    ]
  }

  // Determine if two coordinates are the same (i.e. have the same number of strictly equal values)
  static same(coordinate1, coordinate2) {
    return coordinate1.length == coordinate2.length &&
        !coordinate1.some((element, index) => element !== coordinate2[index])
  }

  static contains(coordinates, coordinate) {
    return coordinates.some(c => State.same(c, coordinate))
  }

  static generateState(rowCount, columnCount, mineCount, baseCoordinates) {

    // Generate mine positions excluding base coordinates
    const mineCoordinates = Array(mineCount)
    for (const index of mineCoordinates.keys()) {
      const mineCoordinate = Array(2)
      do {
        mineCoordinate[0] = Math.floor(Math.random() * rowCount)
        mineCoordinate[1] = Math.floor(Math.random() * columnCount)
      } while (State.same(baseCoordinates, mineCoordinate) || State.contains(mineCoordinates, mineCoordinate))
      mineCoordinates[index] = mineCoordinate
    }

    const countNeighborMines = (y, x) => {
      return State.calculateNeighborCoordinates(y, x)
          .filter(coordinate => State.contains(mineCoordinates, coordinate)).length
    }

    // Generate state
    const cells = Array(rowCount)
    for (const y of cells.keys()) {
      const row = Array(columnCount)
      for (const x of row.keys()) {
        if (State.contains(mineCoordinates, [y, x])) {
          row[x] = new Cell('M', false, false)
        } else {
          row[x] = new Cell(countNeighborMines(y, x), false, false)
        }
      }
      cells[y] = row
    }
    return new State(cells, mineCoordinates)
  }
}
