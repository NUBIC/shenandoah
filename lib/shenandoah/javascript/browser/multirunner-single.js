if (!window.shenandoah) { shenandoah = { }; }

(function ($) {
  shenandoah.MultirunnerFrame = function () {
    // Finds the IFRAME which contains this window in the parent DOM
    var containingFrame = $.grep(window.parent.jQuery('iframe'), function (iframe, idx) {
      return iframe.contentWindow === window;
    })[0];

    function parentTrigger(name, data) {
      if (containingFrame) {
        window.parent.jQuery(containingFrame).trigger(name, data);
      }
    }

    this.register = function () {
      $(Screw).bind('after', function () {
        parentTrigger('complete', {
          passed_count: $('.passed').length,
          failed_count: $('.failed').length,
          total_count: $('.passed').length + $('.failed').length
        });
      });
    };
  };


  $(document).ready(function () {
    new shenandoah.MultirunnerFrame().register();
  });

}(jQuery));
