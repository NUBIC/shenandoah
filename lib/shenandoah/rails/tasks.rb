require 'shenandoah/tasks'
require 'shenandoah/rails/locator'

module Shenandoah
  module Rails
    class Tasks < Shenandoah::Tasks
      def initialize(options = {})
        super(options.merge(:generate_task => false))
      end

      protected

      def default_locator_type
        Locator
      end
    end
  end
end