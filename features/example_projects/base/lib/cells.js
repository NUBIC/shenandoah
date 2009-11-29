Cell = function (initialState) {
  this.willSurvive = true;
  this.age = (initialState && initialState.age) || 0;

  this.alive = function () {
    return this.age > 0;
  };

  this.advance = function () {
    if (this.willSurvive) {
      this.age += 1;
    } else {
      this.age = 0;
    }
  };
};

Cells = function () {
  var matrix;

  function buildMatrix(rows, columns) {
    matrix = new Array(rows);
    var i, j;
    for (i = 0 ; i < rows ; i++) {
      matrix[i] = new Array(columns);
      for (j = 0 ; j < columns ; j++) {
        matrix[i][j] = new Cell();
      }
    }
  }

  function initializeMatrix(args) {
    if (args.length == 1) {
      var input = args[0];
      var rows = input.length; var cols = input[0].length;
      buildMatrix(rows, cols);
      var i, j, item;
      for (i = 0 ; i < rows ; i++) {
        for (j = 0 ; j < cols ; j++) {
          item = input[i][j];
          age = 0;
          if (item) {
            if (!isNaN(parseInt(item))) {
              age = parseInt(item);
            } else if (item === '+') {
              age = 1;
            } else if (item === '.') {
              age = 0;
            } else if (item.match) {
              age = item.match(/\S/) ? 1 : 0;
            } else {
              age = 1;
            }
          }
          matrix[i][j].age = age;
        }
      }
    } else if (args.length == 2) {
      buildMatrix(args[0], args[1]);
    }
  }

  this.get = function (r, c) {
    if (r < 0 || r >= this.rowCount()) {
      return null;
    }
    return matrix[r][c];
  };

  this.getAdjacency = function (r, c) {
    return new Adjacency({
      nw: this.get(r - 1, c - 1), n: this.get(r - 1, c), ne: this.get(r - 1, c + 1),
       w: this.get(r, c - 1),                             e: this.get(r, c + 1),
      sw: this.get(r + 1, c - 1), s: this.get(r + 1, c), se: this.get(r + 1, c + 1),
    });
  };

  this.rowCount = function () {
    return matrix.length;
  };

  this.columnCount = function () {
    return matrix[0].length;
  };

  initializeMatrix(arguments);
};

Adjacency = function (adjacentCells) {
  var EDGES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  var self = this;
  var liveCount = 0;

  jQuery.each(EDGES, function (i, v) {
    self[v] = adjacentCells[v] || new Cell();
    if (self[v].alive()) {
      liveCount += 1;
    }
  });

  this.liveCount = function () {
    return liveCount;
  }
};
