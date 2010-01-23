0.2.1
=====

## Internal

* Update embedded buildr mirror (used for testing) to apache's git mirror of buildr instead of github's
* Use bundler for development dependencies

0.2.0
=====

## Features

* Running multiple specs in-browser using iframes (issue #5)
* Use a single stylesheet for single specs, multirunner, and index page
* Allow override of the default runner stylesheet using a file at the root of spec_path; either shenandoah.sass or shenandoah.css

## Internal

* Stop publishing the gem to rubyforge (but continue deploying rdoc there)
* Basic full-execution test coverage with cucumber features

0.1.3
=====

* Correct generator-related bug that made rails mode not work
* Publish with/on Gemcutter

0.1.2
=====

* Fix javascript spec template (generated code was not correct)
* Only generate the spec helper require when spec_helper.js exists

0.1.1
=====

* Correct bug in Shenandoah::Tasks which made plain-Rakefile use not work
* Add task descriptions for all the tasks -- visible with rake -T
* Automatically absolutize locator paths for plain-Rakefile use
* Allow specs to be constrained using rake task arguments instead of an env var
* Allow spec generator to be invoked from any project (not just rails projects) via `rake shen:generate[spec_name]`

0.1.0
=====

* Supports easier configuration with rails
  * script/generate shenandoah to outfit a rails project
  * script/generate shen_spec *name* to generate a spec and a fixture

shenandoah 0.0.0
================

* Initial version -- extracted from PSC's buildr-ridge extension, which was itself derived from the Blue Ridge JavaScript Testing Plugin
* Supports buildr
* Supports generic execution with rake
