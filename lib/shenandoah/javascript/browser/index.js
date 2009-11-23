(function ($) {
  $(document).ready(function () {
    var checkboxes_selector = "form input";

    $('#select-all input').click(function () {
      if ($(this).is(':checked')) {
        $(checkboxes_selector).attr('checked', true);
      } else {
        $(checkboxes_selector).attr('checked', false);
      }
    });

    $(checkboxes_selector).click(function () {
      $('#select-all input').attr('checked', 
        $(checkboxes_selector).filter(':checked').size() == $(checkboxes_selector).size());
    });
  });
}(jQuery));
