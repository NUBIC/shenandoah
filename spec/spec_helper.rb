require 'spec'
require 'rubygems'

$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))

Spec::Runner.configure do |config|
  
end

module Shenandoah
  module Spec
    module Tmpfile
      attr_accessor :tmpdir

      def tmpfile(name, contents="contents not important")
        f = "#{tmpdir}/#{name}"
        FileUtils.mkdir_p File.dirname(f)
        File.open(f, 'w') { |f| f.write contents }
        f
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
  end
end