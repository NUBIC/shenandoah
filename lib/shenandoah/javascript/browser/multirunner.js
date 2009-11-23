if (!window.shenandoah) { var shenandoah = {}; }

(function ($) {
  shenandoah.Multirunner = function (container_id, spec_urls) {
    ////// PRIVATE

    var runner = this;

    function container(subselector) {
      var sel = "#" + runner.container_id;
      if (subselector) sel += ' ' + subselector;
      return jQuery(sel);
    }

    ////// PUBLIC

    this.container_id = container_id;
    this.spec_urls = spec_urls;

    this.run = function () {
      this.frames = container("#frames iframe").get();
      this.next();
    }

    this.next = function () {
      if (this.frames && this.frames.length > 0) {
        setTimeout(function () { jQuery(runner.frames.shift()).trigger('begin') }, 0);
      } else {
        var show = container('#specs li.failed').get(0) || container('#specs li').get(0);
        jQuery(show).trigger('activate');
      }
    }

    this.reset = function () {
      container().empty();
      this.frames = null;
    }

    ////// INITIALIZATION

    if (!this.spec_urls || this.spec_urls.length === 0) {
      container().append("<p>No specs selected to run</p>")
    } else {
      container().append("<ul id='specs'></ul>").append("<div id='frames'></div>");
      jQuery(this.spec_urls).each(function (idx) {
        container("#specs").append('<li class="spec inactive"><span class="name">' + this.replace(/\/spec\//, "") + '</span>&nbsp;<span class="count"></span></li>');
        container("#frames").append('<iframe class="inactive" spec-url="' + this + '" src="about:blank"></iframe>');
        var newLi = container("#specs li:last-child");
        var newFrame = container("#frames iframe:last-child");
        var both = jQuery(newLi.selector + ", " + newFrame.selector);

        both.bind('activate', function () {
          both.removeClass('inactive').addClass('active');
        }).bind('deactivate', function () {
          both.addClass('inactive').removeClass('active');
        });

        newFrame.bind("begin", null, function (evt, data) {
          newLi.find('.count').empty().end().trigger('activate');
          newFrame.attr('src', newFrame.attr('spec-url'));
        });

        newFrame.bind("complete", null, function (evt, data) {
          newLi.find('.count').text(data.passed_count + " of " + data.total_count).end().
            removeClass('passed').removeClass('failed').addClass(data.passed_count === data.total_count ? 'passed' : 'failed').
            trigger('deactivate');
          runner.next();
        });

        newLi.bind('click', function () {
          container('#frames iframe').trigger('deactivate');
          newFrame.trigger('activate');
          return false;
        });
      });
    }
  };

  $(document).ready(function () {
    var specs = jQuery.parseQuery().spec;
    if (specs && specs.constructor !== Array) {
      specs = [specs];
    }
    new shenandoah.Multirunner('runner', specs).run();
  });

}(jQuery));
