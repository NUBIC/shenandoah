require 'buildr'

require 'shenandoah/tasks'
require 'shenandoah/buildr/locator'

module Buildr::JavaScript # :nodoc:
  module ShenandoahTasks
    include Buildr::Extension

    after_define do |project|
      if project.test.framework == :shenandoah
        ::Shenandoah::Tasks.new(
          :locator => ::Shenandoah::Buildr::Locator.new(project))
      end
    end
  end
end
