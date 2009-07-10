require 'rails_generator'
require 'shenandoah/rails/locator'

module Shenandoah
  module Generators
    class ShenSpecGenerator < ::Rails::Generator::NamedBase
      def manifest
        spec_path = ENV['SHEN_SPEC_PATH'] || Shenandoah::Rails::Locator.new.spec_path.sub(%r{^#{RAILS_ROOT}/}, '')
        record do |m|
          m.directory "#{spec_path}/#{File.dirname(file_path)}"
          m.template 'javascript_spec.js.erb', "#{spec_path}/#{file_path}_spec.js"
          m.template 'fixture.html.erb', "#{spec_path}/#{file_path}.html"
        end
      end

      def file_path
        super.sub /_spec$/, ''
      end

      def javascript_class_name
        klass, *mods_rev = class_name.sub(/Spec$/, '').split('::').reverse
        mod_spec = mods_rev.reverse.collect { |m| m.downcase }.join('.')
        [mod_spec, klass].reject { |p| p == "" }.join '.'
      end
    end
  end
end
