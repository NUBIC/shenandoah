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
    
    def run_specs(pattern=nil)
      files = @locator.spec_files
      if ENV['SHEN_SPEC']
        trace "limiting shenandoah specs based on #{ENV['SHEN_SPEC'].inspect}"
        files = files.select { |f| f =~ /#{ENV['SHEN_SPEC']}/ }
      end
      if pattern
        trace "limiting shenandoah specs based on #{pattern.inspect}"
        files = files.select { |f| f =~ /#{pattern}/ }
      end
      trace "running shenandoah specs\n - #{files.join("\n - ")}"
      successes = @runner.run_console(files)
      if (successes.size != files.size)
        raise "Shenandoah specs failed!"
      end
    end
    
    protected
    
    def trace(msg)
      $stderr.puts msg if Rake.application.options.trace
    end
    
    def default_locator_type
      DefaultLocator
    end
    
    def create_serve_task
      desc "Start the in-browser JavaScript spec runner on http://localhost:4410/"
      task('shen:serve') do |t|
        Shenandoah::Server.set :locator, @locator
        if @options[:project_name]
          Shenandoah::Server.set :project_name, @options[:project_name]
        end
        Shenandoah::Server.run!
      end
    end
    
    def create_shell_task
      desc "Start the Shenandoah interactive JavaScript shell"
      task('shen:shell') do |t|
        @runner.run_shell
      end
    end
    
    def create_run_task
      desc "Run the JavaScript specs"
      task('shen:spec', :pattern) do |t, args|
        run_specs args.pattern
      end
    end
  end
end
