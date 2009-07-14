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
