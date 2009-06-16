require 'rails_generator'
require 'shenandoah/rails/locator'

module Shenandoah
  module Generators
    class ShenandoahGenerator < ::Rails::Generator::Base
      def manifest
        spec_path = Shenandoah::Rails::Locator.new.spec_path.sub %r{^#{RAILS_ROOT}/}, ''
        record do |m|
          m.directory "lib/tasks"
          m.file "shenandoah.rake", "lib/tasks/shenandoah.rake"
          
          m.directory spec_path
          m.file "spec_helper.js", "#{spec_path}/spec_helper.js"
          m.file "application_spec.js", "#{spec_path}/application_spec.js"
          m.file "application.html", "#{spec_path}/application.html"
        end
      end
    end
  end
end