require 'rake'

module Shenandoah
  class DefaultLocator
    attr_accessor :main_path, :spec_path, :tmp_path

    def initialize(options = {})
      @main_path = File.expand_path(options[:main_path] || "lib")
      @spec_path = File.expand_path(options[:spec_path] || "spec")
      @tmp_path = File.expand_path(options[:tmp_path] || ENV['TMPDIR'] || "tmp")
    end

    def spec_files
      FileList["#{spec_path}/**/*_spec.js"]
    end

    private
  end
end