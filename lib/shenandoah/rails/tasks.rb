# This class is just sugar for initing Shenandoah::Tasks with a rails locator

require 'shenandoah/tasks'
require 'shenandoah/rails/locator'

module Shenandoah
  module Rails
    class Tasks < Shenandoah::Tasks
      protected
      
      def default_locator_type
        Locator
      end
    end
  end
end