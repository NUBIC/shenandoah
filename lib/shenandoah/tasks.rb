require 'rake'
require 'shenandoah/locator'
require 'shenandoah/runner'
require 'shenandoah/server'

module Shenandoah
  class Tasks
    attr_accessor :locator, :options, :runner
    
    def initialize(options = {})
      @options = options
      @locator =
        if options[:locator]
          options[:locator]
        else
          default_locator_type.new(options)
        end
      @runner = Shenandoah::Runner.new(@locator)
      create_serve_task
      create_shell_task
      create_run_task
    end
    
    def run_specs
      files = @locator.spec_files
      if ENV['SHEN_SPEC']
        files = files.select { |f| f =~ /#{ENV['SHEN_SPEC']}/ }
      end
      successes = @runner.run_console(files)
      if (successes.size != files.size)
        raise "Shenandoah specs failed!"
      end
    end
    
    protected
    
    def default_locator_type
      DefaultLocator
    end
    
    def create_serve_task
      task('shen:serve') do |t|
        Shenandoah::Server.set :locator, @locator
        if @options[:project_name]
          Shenandoah::Server.set :project_name, @options[:project_name]
        end
        Shenandoah::Server.run!
      end
    end
    
    def create_shell_task
      task('shen:shell') do |t|
        @runner.run_shell
      end
    end
    
    def create_run_task
      task('shen:spec') do |t|
        run_specs
      end
    end
  end
end
