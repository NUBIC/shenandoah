require File.expand_path("../../vendor/gems/environment", __FILE__)

require 'spec'
require 'rubygems'

Spec::Runner.configure do |config|

end

module Shenandoah
  module Spec
    def self.load_path_additions
      [
        File.dirname(__FILE__),
        File.join(File.dirname(__FILE__), '..', 'lib')
      ]
    end

    def self.rake_bin
      @rake_bin ||= File.expand_path("../../gem_bin/rake", __FILE__)
    end

    module Tmpfile
      attr_writer :tmpdir

      def tmpfile(name, contents="contents not important")
        n = "#{tmpdir}/#{name}"
        FileUtils.mkdir_p File.dirname(n)
        File.open(n, 'w') { |f| f.write contents }
        n
      end

      def tmpscript(name, contents)
        tmpfile name,
          Shenandoah::Spec.load_path_additions.
            map { |a| "$LOAD_PATH.unshift(#{a.inspect})" }.
            join("\n") + "\n" + contents
      end

      def tmpdir(name=nil)
        n = @tmpdir
        if (name)
          n = File.join(n, name)
          FileUtils.mkdir_p(n)
        end
        n
      end

      def self.included(klass)
        klass.class_eval do
          before do
            FileUtils.mkdir_p(self.tmpdir = File.dirname(__FILE__) + "/tmp")
          end

          after do
            FileUtils.rm_r self.tmpdir
          end
        end
      end
    end

    module RailsRoot
      def self.included(klass)
        klass.class_eval do
          include Shenandoah::Spec::Tmpfile

          before do
            Object.const_set(:RAILS_ROOT, tmpdir('rails-root'))
          end

          after do
            Object.instance_eval { remove_const :RAILS_ROOT }
          end
        end
      end
    end
  end
end

Shenandoah::Spec.load_path_additions.each { |p| $LOAD_PATH.unshift(p) }
