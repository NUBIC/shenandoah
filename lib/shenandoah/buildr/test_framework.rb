require 'shenandoah/runner'
require 'shenandoah/buildr/locator'

module Buildr
  module JavaScript
    class Shenandoah < TestFramework::Base
      class << self
        def applies_to?(project)
          !::Shenandoah::Buildr::Locator.new(project).spec_files.empty?
        end
      end

      def initialize(test_task, options)
        super
        @locator = ::Shenandoah::Buildr::Locator.new(test_task.project)
        @runner = ::Shenandoah::Runner.new(@locator, options)
      end

      def tests(dependencies)
        @locator.spec_files
      end
      
      def run(tests, dependencies)
        @runner.run_console(tests)
      end
    end
  end
end
