Shenandoah JavaScript Testing metapackage
=========================================

Shenandoah adds support for command-line and in-browser JavaScript unit tests in your buildr, rails, or other rake-using project.  It bundles several great tools together in a convention-over-configuration, Rails-like way.  These tools include:

* `Rhino` - a Java-based JavaScript interpreter
* `Screw.Unit` - a behaviour-driven development syntax for JavaScript similar to RSpec
* `Smoke` - a JavaScript mocking & stubbing library similar to Mocha
* `env.js` - a DOM implementation written entirely in JavaScript

Shenandoah is a generalization of the [Blue Ridge][blue-ridge] plugin for rails.  (See below for differences.)

[blue-ridge]: http://github.com/relevance/blue-ridge

General Use
-----------

Shenandoah provides a command-line runner and a server to enable in-browser testing with simple path management.

The command-line runner is a lot like any other test framework's:  It runs some or all of the specs and tells you which ones fail.

The server (after you start it), is available at [http://localhost:4410/](http://localhost:4410/).  The root path will give you a list of specs, linked to the pages where you can run them.

Shenandoah also provides an interactive shell a la `irb`.  You can use it to experiment with javascript in a similar context to the command line runner.

The following sections describe how to invoke Shenandoah with various build systems.

Installing and Running
----------------------

The Shenandoah gem is hosted at [Gemcutter](http://gemcutter.org/).  If you haven't yet, set up your gem environment to use Gemcutter:

    $ gem install gemcutter
    $ gem tumble

You can verify that this worked like so:

    $ gem sources
    *** CURRENT SOURCES ***
    
    http://gemcutter.org
    http://gems.rubyforge.org/
    http://gems.github.com/

If the gemcutter URL isn't present, run `gem tumble` again or check [Gemcutter's docs](http://gemcutter.org/pages/docs) for advice.

When that's square, install Shenandoah:

    $ gem install shenandoah

### Use with buildr

    # In your buildfile
    require 'shenandoah/buildr'
    # ...
    define :web_js do
      test.using :shenandoah, :main_path => project('web')._("src/main/webapp/js")
    end

In buildr, Shenandoah expects to find your specs in the `src/spec/javascript` directory.  The main path defaults to `src/main/javascript`, but may be changed as in the example.

To run the specs from the command line:

    $ buildr web_js:test

To run an individual spec file called "application_spec.js":

    $ cd web_js
    web_js$ buildr test:application

To start the server:

    $ buildr web_js:shen:serve

To start the shell:

    $ buildr web_js:shen:shell

### Use with Rails

Add a config.gem entry in environment.rb:

    config.gem "shenandoah", :version => '0.1.0', :lib => false

Install the rake tasks:

    $ script/generate shenandoah

In a rails project, Shenandoah will look for specs in `spec/javascript`, `examples/javascript`, or `test/javascript`.  The main path is `public/javascripts`.

To run the specs from the command line:

    $ rake shen:spec

To run an individual spec file called "application_spec.js":

    $ rake shen:spec[application]

To start the server:

    $ rake shen:serve

To start the shell:

    $ rake shen:shell

### Use with rake (in general)

    # In your Rakefile
    require 'rubygems'
    require 'shenandoah/tasks'
    Shenandoah::Tasks.new(:main_path => 'public/javascript', :spec_path => 'test/javascript')

With plain rake, Shenandoah defaults to `lib` for the main path and `spec` for the spec path.

To run all the specs from the command_line:

    $ rake shen:spec

To run an individual spec file called "application_spec.js":

    $ rake shen:spec[application]

To start the server:

    $ rake shen:serve

To start the shell:

    $ rake shen:shell

Specs and Fixtures
------------------

Each Shenandoah spec is two files: a javascript spec (e.g. `name_spec.js`) and and HTML fixture (e.g. `name.html`).  The spec contains the the actual Screw.Unit test definitions.  The fixture contains the DOM that the spec (or the code under test) relies on to work.

Example Using jQuery
--------------------

Shenandoah is opinionated and assumes you're using jQuery by default.  The plugin itself actually uses jQuery under the covers to run Screw.Unit.

    require_spec("spec_helper.js");
    require_main("application.js");

    Screw.Unit(function() {
      describe("Your application javascript", function() {
        it("does something", function() {
          expect("hello").to(equal, "hello");
        });

        it("accesses the DOM from fixtures/application.html", function() {
          expect($('.select_me').length).to(equal, 2);
        });
      });
    });

(By the way, we don’t actually encourage you to write specs and tests for standard libraries like JQuery and Prototype. It just makes for an easy demo.)

Example Using Prototype
-----------------------

It's very easy to add support for Prototype.  Here's an example spec:

    jQuery.noConflict();
    
    require_spec("spec_helper.js");
    require_main("prototype.js");
    require_main("application.js");

    Screw.Unit(function() {
      describe("Your application javascript", function() {
        it("does something", function() {
          expect("hello").to(equal, "hello");
        });

        it("accesses the DOM from fixtures/application.html", function() {
          expect($$('.select_me').length).to(equal, 2);
        });
      });
    });

More Examples
-------------

To see Shenandoah in action inside a working Rails app, check out the [Shenandoah sample application](http://github.com/rsutphin/shenandoah-rails-sample-app).  Among other things, this sample app includes examples of:

* using nested `describe` functions
* setting up per-spec HTML "fixtures"
* stubbing functions
* mocking functions
* running the javascript specs as part of your default Rake task

JavaScript API
--------------

Shenandoah provides a handful of functions that help you write specs that can run inside a web browser as well from the Rhino command-line test runner.

### require_main(filename)

Loads a dependency from the main path.

When running from the command line, `require_main` becomes a Rhino call to `load`, resolving the file against the configured `main_path`.  In a web browser, `require_main` loads and evaluates the script using a synchronous background request to ensure that all the scripts are loaded in order.

### require_spec(filename)

Loads a dependency from the spec path.

Just like `require_main`, but for spec files.

The Shell
---------

Shenandoah provides an `irb`-like JavaScript shell for debugging your JavaScript code.  jQuery and env.js are pre-loaded for you to make debugging DOM code easy.

    =================================================
     Rhino JavaScript Shell
     To exit type 'exit', 'quit', or 'quit()'.
    =================================================
     - loaded env.js
     - sample DOM loaded
     - jQuery-1.2.6 loaded
    =================================================
    Rhino 1.7 release 2 PRERELEASE 2008 07 28
    js> print("Hello World!")
    Hello World!
    js> 

Note that if you have `rlwrap` installed and on the command line path (and you really, really should!), then command-line history and readline arrow-up and down will be properly supported automatically. (You can get `rlwrap` from your friendly neighborhood package manager.)

Mocking Example with Smoke
--------------------------

Smoke is a JavaScript mocking and stubbing toolkit that is somewhat similar to FlexMock or Mocha.  It is automatically wired-in to undo its mocking after each Screw.Unit `it` block.  Here's an example.

    it("calculates the total cost of a contract by adding the prices of each component", function() {
      var componentX = {}, componentY = {};
      mock(SalesContract).should_receive("calculateComponentPrice").with_arguments(componentX).exactly(1, "times").and_return(42);
      mock(SalesContract).should_receive("calculateComponentPrice").with_arguments(componentY).exactly(1, "times").and_return(24);
      expect(SalesContract.calculateTotalCost([componentX, componentY])).to(equal, 66);
    });

Note that the flexible nature of the JavaScript the language means that you might not need to use Smoke, especially for stubbing.

Tips & Tricks
-------------
* Avoid using `print` in your tests while debugging.  It works fine from the command line but causes lots of headaches in browser.  (Just imagine a print dialog opening ten or fifteen times and then Firefox crashing.  This is a mistake I've made too many times!  Trust me!)

Bugs & Patches
--------------

If you see any bugs or possible improvements, please use the project's [GitHub issue tracker](http://github.com/rsutphin/shenandoah/issues) to report them.

If you like, you could even fork the [GitHub repo](http://www.github.com/rsutphin/shenandoah) and start hacking.

Differences from Blue Ridge
---------------------------

Shenandoah is based on the [Blue Ridge JavaScript Testing Rails Plugin][blue-ridge].  The main difference is that it works for any project that uses rake or buildr, not just rails projects.  If you are using a rails project, you might consider using Shenandoah instead of Blue Ridge anyway:

* Blue Ridge requires all specs to be in the same directory (subdirectories are not allowed).  Shenandoah does not have this limitation.
* Shenandoah's design places the spec js and the fixture html in the same directory.  Blue Ridge puts them in separate directories, leading to parallel hierarchies.
* Shenandoah provides an in-browser index for the specs.  Blue Ridge requires opening each HTML fixture separately.

The cost for all this is that Shenandoah fixtures can't be opened directly in the browser &mdash; they can only be opened via the server.

Links
-----

* [Blue Ridge JavaScript Testing Rails Plugin](http://github.com/relevance/blue-ridge)
* [Blue Ridge Sample App](http://github.com/relevance/blue-ridge-sample-app)
* [Justin Gehtland's "Fully Headless JSSpec" Blog Post](http://blog.thinkrelevance.com/2008/7/31/fully-headless-jsspec)
* [Screw.Unit](http://github.com/nkallen/screw-unit)
* [Screw.Unit Mailing List](http://groups.google.com/group/screw-unit)
* [Smoke](http://github.com/andykent/smoke)
* [env.js](http://github.com/thatcher/env-js)
* [env.js Mailing List](http://groups.google.com/group/envjs)
* [Mozilla Rhino](http://www.mozilla.org/rhino/)
* [W3C DOM Specifications](http://www.w3.org/DOM/DOMTR)

Contributors
------------
* Justin Gehtland
* Geof Dagley
* Larry Karnowski
* Chris Thatcher (for numerous env.js bug fixes!)
* Raimonds Simanovskis
* Jason Rudolph

Copyrights
------------
* Copyright &copy; 2009 Rhett Sutphin, under the MIT license
* Based on blue-ridge, Copyright 2008-2009 [Relevance, Inc.](http://www.thinkrelevance.com/), under the MIT license
* env.js     - Copyright 2007-2009 John Resig, under the MIT License
* Screw.Unit - Copyright 2008 Nick Kallen, license attached
* Rhino      - Copyright 2009 Mozilla Foundation, GPL 2.0
* Smoke      - Copyright 2008 Andy Kent, license attached
