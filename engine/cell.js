function Cell(value, visited, marked) {
  if (value == 'M') {
    this.value = value
  } else {
    value = parseInt(value)
    if (value >= 0 && value <= 8) this.value = value
    else throw 'Cell value is not valid'
  }

  // Loosely convert to boolean
  function toBoolean(value) {
    return value != false
  }

  // Compare with false explicitly, as visited and marked may not be booleans
  if (visited == false || marked == false) {
    this.visited = toBoolean(visited)
    this.marked = toBoolean(marked)
  }
  else throw 'Cell flags are not valid'

  this.hasMine = function() {
    return this.value == 'M'
  }

  this.toString = function() {

    // Convert boolean to integer
    var visitedInt = +this.visited
    var markedInt = +this.marked
    return String(value) + String(visitedInt) + String(markedInt)
  }
}

Cell.fromString = function(string) {
  if (string.length != 3) throw 'There should be 3 cell attributes'

  var value = string.substr(0, 1)
  var visited = string.substr(1, 1)
  var marked = string.substr(2, 1)
  return new Cell(value, visited, marked)
}
