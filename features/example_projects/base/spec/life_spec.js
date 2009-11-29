require_main('cells.js');
require_main('life.js');

Screw.Unit(function () {
  describe('Life', function () {
    var game;
    before(function () {
      game = new Life(new Cells([
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]));
    });

    it("steps", function () {
      game.step();
      expect(game.cells.get(0, 0).age).to(equal, 0);
      expect(game.cells.get(0, 1).age).to(equal, 0);
      expect(game.cells.get(0, 2).age).to(equal, 0);
      expect(game.cells.get(1, 0).age).to(equal, 1);
      expect(game.cells.get(1, 1).age).to(equal, 2);
      expect(game.cells.get(1, 2).age).to(equal, 1);
      expect(game.cells.get(2, 0).age).to(equal, 0);
      expect(game.cells.get(2, 1).age).to(equal, 0);
      expect(game.cells.get(2, 2).age).to(equal, 0);
    });
  });
});
