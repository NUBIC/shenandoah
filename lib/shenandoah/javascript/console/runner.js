if(arguments.length == 0) {
  print("Usage: test_runner.js /path/to/shenandoah /path/to/mainfiles /path/to/specfiles file_spec.js");
  quit(1);
}

var SHENANDOAH = arguments[0]
var MAIN_PATH = arguments[1]
var SPEC_PATH = arguments[2]
var SPEC_FILE = arguments[3]

function require_main(file) {
  require_absolute(MAIN_PATH + '/' + file)
}

function require_spec(file) {
  require_absolute(SPEC_PATH + '/' + file)
}

function require_absolute(file) {
  load(file)
}

var fixture = SPEC_FILE.replace(/^(.*?)_spec\.js$/, "$1.html");
print("Running " + SPEC_FILE + " with fixture '" + fixture + "'");

load(SHENANDOAH + "/lib/shenandoah/javascript/console/env.rhino.js");
window.location = fixture;

load(SHENANDOAH + "/lib/shenandoah/javascript/common/jquery-1.3.2.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/jquery.fn.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/jquery.print.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/screw.builder.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/screw.matchers.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/screw.events.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/screw.behaviors.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/smoke.core.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/smoke.mock.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/smoke.stub.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/common/screw.mocking.js");
load(SHENANDOAH + "/lib/shenandoah/javascript/console/consoleReportForRake.js");

load(SPEC_PATH + '/' + SPEC_FILE);
jQuery(window).trigger("load");
