require 'shenandoah/locator'

module Shenandoah
  module Rails
    class Locator < Shenandoah::DefaultLocator
      def initialize(options={})
        super(
          :main_path => File.join(RAILS_ROOT, options[:main_path] || "public/javascripts"),
          :spec_path => File.join(RAILS_ROOT, options[:spec_path] || select_spec_subpath),
          :tmp_path =>  File.join(RAILS_ROOT, "tmp/shenandoah")
        )
      end

      private

      def select_spec_subpath
        %w(spec examples).each do |candidate|
          if File.directory?(File.join(RAILS_ROOT, candidate))
            return "#{candidate}/javascript"
          end
        end

        "test/javascript" # default
      end
    end
  end
end