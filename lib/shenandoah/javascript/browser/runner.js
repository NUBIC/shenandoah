// Ported from blue-ridge.js in blue-ridge
function require_spec(url, options) {
  require_absolute("/spec/" + url, options)
}

function require_main(url, options) {
  require_absolute("/main/" + url, options)
}

function require_absolute(url, options) {
  // Use synchronous XmlHttpRequests instead of dynamically
  // appended <SCRIPT> tags for IE compatibility.
  // (IE doesn't guarantee that the tags will be evaluated in order.)
  jQuery.ajax({
    dataType: 'script',
    async: false,
    url: url,
    error: function () {
      alert("Could not load required path " + url)
    }
  })
}

function debug(message) {
  document.writeln(message + " <br/>");
}

function derive_spec_name_from_current_file() {
  var file_prefix = new String(window.location).match(/spec\/(.*?)\.html/)[1];
  return file_prefix + "_spec.js";
}

require_spec(derive_spec_name_from_current_file());

