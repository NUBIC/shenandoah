require 'buildr'
require 'shenandoah/buildr/test_framework'
require 'shenandoah/buildr/shenandoah_tasks'

Buildr::TestFramework << Buildr::JavaScript::Shenandoah

class Buildr::Project
  include Buildr::JavaScript::ShenandoahTasks
end
