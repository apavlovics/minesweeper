const MINE = "M";

export default class Cell {
  constructor(value, visited, marked) {
    if (value == MINE) {
      this.value = value;
    } else {
      value = parseInt(value);
      if (value >= 0 && value <= 8) {
        this.value = value;
      } else {
        throw "Cell value is not valid";
      }
    }

    // Loosely convert to boolean
    this.visited = visited == true;
    this.marked = marked == true;
    if (this.visited && this.marked) {
      throw "Cell flags are not valid";
    }
  }

  get hasMine() {
    return this.value == MINE;
  }

  toString() {
    // Convert boolean to integer
    const visitedInt = +this.visited;
    const markedInt = +this.marked;
    return String(this.value) + visitedInt + markedInt;
  }

  static fromString(string) {
    if (string.length != 3) {
      throw "There must be 3 cell attributes";
    }
    const value = string.substr(0, 1);
    const visited = string.substr(1, 1);
    const marked = string.substr(2, 1);
    return new Cell(value, visited, marked);
  }
}
