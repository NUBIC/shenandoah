Life = function (cells) {
  var self = this;
  
  this.cells = cells;

  function willLive(r, c) {
    var adj = self.cells.getAdjacency(r, c);
    switch (adj.liveCount()) {
      case 2: // no change
        return self.cells.get(r, c).alive();
      case 3: // always live
        return true;
      default: // alwaysDie
        return false;
    }
  }

  this.step = function () {
    for (var r = 0 ; r < this.cells.rowCount() ; r++) {
      for (var c = 0 ; c < this.cells.columnCount() ; c++) {
        this.cells.get(r, c).willSurvive = willLive(r, c);
      }
    }
    for (var r = 0 ; r < this.cells.rowCount() ; r++) {
      for (var c = 0 ; c < this.cells.columnCount() ; c++) {
        this.cells.get(r, c).advance();
      }
    }
  };
}
