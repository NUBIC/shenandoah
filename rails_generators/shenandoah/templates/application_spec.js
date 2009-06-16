require_spec('spec_helper.js');
require_main('application.js');

Screw.Unit(function () {
  describe("Your application javascript", function () {
    it("does something", function () {
      expect("hello").to(equal, "hello");
    });

    it("accesses the DOM from fixtures/application.html", function () {
      expect($('.select_me').length).to(equal, 2);
    });
  });
});
