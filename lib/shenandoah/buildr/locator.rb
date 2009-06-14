require 'shenandoah/locator'

module Shenandoah # :nodoc:
  module Buildr # :nodoc:
    class Locator < DefaultLocator
      def initialize(project)
        super(
          :main_path => project.test.options[:main_path] || 
                        project.path_to(:source, :main, :javascript),
          :spec_path => project.path_to(:source, :spec, :javascript),
          :tmp_path => project.path_to(:target, :shenandoah)
        )
      end
    end
  end
end
    