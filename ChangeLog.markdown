0.1.1
=====

* Correct bug in Shenandoah::Tasks which made plain-Rakefile use not work
* Add task descriptions for all the tasks -- visible with rake -T
* Automatically absolutize locator paths for plain-Rakefile use

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
