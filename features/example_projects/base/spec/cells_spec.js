require_main('cells.js');

Screw.Unit(function () {
  describe('Cell', function () {
    describe("initialization", function () {
      it("defaults to a dead cell", function () {
        expect((new Cell()).age).to(equal, 0);
      });

      it("accepts an initial age", function () {
        expect((new Cell({ age: 3 })).age).to(equal, 3);
      });
    });

    it("is alive if its age is positive", function () {
      expect((new Cell({ age: 4 })).alive()).to(be_true);
    });

    it("is not alive if its age is zero", function () {
      expect((new Cell({ age: 0 })).alive()).to(be_false);
    });

    describe("#advance", function () {
      var cell;

      before(function () {
        cell = new Cell({ age: 5 });
      })

      it("increments the age if it will survive", function () {
        cell.willSurvive = true;
        cell.advance();
        expect(cell.age).to(equal, 6);
      });

      it("resets the age if it will not survive", function () {
        cell.willSurvive = false;
        cell.advance();
        expect(cell.age).to(equal, 0);
      });
    });
  });

  describe('Cells', function () {
    describe("initialization", function () {
      var board;
      describe("from an array of arrays", function () {
        before(function () {
          board = new Cells([
            [true, false, null],
            [0, 1, 2],
            [undefined, "", "s"]
          ]);
        });

        it("has the right number of rows", function () {
          expect(board.rowCount()).to(equal, 3);
        });

        it("has the right number of columns", function () {
          expect(board.columnCount()).to(equal, 3);
        });

        it("treats true as set", function () {
          expect(board.get(0, 0).age).to(equal, 1);
        });

        it("treats false as not set", function () {
          expect(board.get(0, 1).age).to(equal, 0);
        });

        it("treats null as not set", function () {
          expect(board.get(0, 2).age).to(equal, 0);
        });

        it("treats 0 as not set", function () {
          expect(board.get(1, 0).age).to(equal, 0);
        });

        it("treats 1 as set", function () {
          expect(board.get(1, 1).age).to(equal, 1);
        });

        it("treats other numbers as an age", function () {
          expect(board.get(1, 2).age).to(equal, 2);
        });

        it("treats undefined as not set", function () {
          expect(board.get(2, 0).age).to(equal, 0);
        });

        it("treats an empty string as not set", function () {
          expect(board.get(2, 1).age).to(equal, 0);
        });

        it("treats a non-empty string as set", function () {
          expect(board.get(2, 2).age).to(equal, 1);
        });
      });

      describe("from an array of strings", function () {
        before(function () {
          board = new Cells([
            ".++..",
            "..+ .",
            "4.+++"
          ]);
        });

        it("finds the correct number of rows", function () {
          expect(board.rowCount()).to(equal, 3);
        });

        it("finds the correct number of columns", function () {
          expect(board.columnCount()).to(equal, 5);
        });

        it("treats + as set", function () {
          expect(board.get(2, 3).age).to(equal, 1);
        });

        it("treats a digit as an age", function () {
          expect(board.get(2, 0).age).to(equal, 4);
        });

        it("treats a . as not set", function () {
          expect(board.get(0, 4).age).to(equal, 0);
        });

        it("treats a space as not set", function () {
          expect(board.get(1, 3).age).to(equal, 0);
        });
      });

      describe("from dimensions", function () {
        before(function () {
          board = new Cells(2, 3);
        });

        it("has the correct number of rows", function () {
          expect(board.rowCount()).to(equal, 2);
        });

        it("has the correct number of columns", function () {
          expect(board.columnCount()).to(equal, 3);
        });

        it("initializes the board with empty cells", function () {
          expect(board.get(0, 0).age).to(equal, 0);
          expect(board.get(0, 1).age).to(equal, 0);
          expect(board.get(0, 2).age).to(equal, 0);
          expect(board.get(1, 0).age).to(equal, 0);
          expect(board.get(1, 1).age).to(equal, 0);
          expect(board.get(1, 2).age).to(equal, 0);
        });
      });
    });

    describe("#get", function () {
      var board;

      before(function () {
        board = new Cells(3, 2);
      });

      jQuery.each([
        ['top',     [-1,  1]],
        ['right',   [ 0,  3]],
        ['bottom',  [ 4,  0]],
        ['left',    [ 1, -1]]
      ], function (i, v) {
        it("returns null for off-board " + v[0], function () {
          expect(board.get.apply(board, v[1])).to(equal, null);
        });
      });
    });

    describe("#getAdjacency", function () {
      var board;

      before(function () {
        board = new Cells([
          ".1..",
          "...2",
          ".543"
        ]);
      });

      describe("for an interior cell", function () {
        var actual;

        before(function () {
          actual = board.getAdjacency(1, 2);
        });

        jQuery.each([
          ['nw', 1], ['n', 0], ['ne', 0],
          [ 'w', 0],           [ 'e', 2],
          ['sw', 5], ['s', 4], ['se', 3]
        ], function (i, v) {
          it("has the right cell for " + v[0], function () {
            expect(actual[v[0]].age).to(equal, v[1]);
          });
        });

        it("has the correct adjacency count", function () {
          expect(actual.liveCount()).to(equal, 5);
        });
      });

      describe("for an edge cell", function () {
        var actual;

        before(function () {
          actual = board.getAdjacency(2, 3);
        });

        jQuery.each([
          ['nw', 0], ['n', 2], ['ne', 0],
          [ 'w', 4],           [ 'e', 0],
          ['sw', 0], ['s', 0], ['se', 0]
        ], function (i, v) {
          it("has the right cell for " + v[0], function () {
            expect(actual[v[0]].age).to(equal, v[1]);
          });
        });

        it("has the correct adjacency count", function () {
          expect(actual.liveCount()).to(equal, 2);
        });
      });
    });
  });
});
