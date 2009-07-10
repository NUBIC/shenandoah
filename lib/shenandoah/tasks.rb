require 'rake'
require 'shenandoah/locator'
require 'shenandoah/runner'
require 'shenandoah/server'
require 'rails_generator'
require 'rails_generator/scripts/generate'

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
      create_gen_task
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
    
    def generate_spec(name)
      raise "Please specify a spec name.  E.g., shen:generate[foo]." unless name
      ::Rails::Generator::Base::prepend_sources( 
        ::Rails::Generator::PathSource.new(
          :shenandoah, File.join(File.dirname(__FILE__), '../../rails_generators'))
      )
      # These branches are functionally equivalent. They change the logging
      # that rails_generator emits to omit the WD when the target is under
      # the WD.
      ENV['SHEN_SPEC_PATH'], dest =
        if @locator.spec_path =~ /^#{FileUtils.pwd}\/?/
          [@locator.spec_path.sub(/^#{FileUtils.pwd}\/?/, ''), FileUtils.pwd]
        else
          [@locator.spec_path, '']
        end
      ::Rails::Generator::Scripts::Generate.new.run(
        ['shen_spec', '-t', name], :destination => dest,
        :quiet => Rake.application.options.quiet)
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
    
    def create_gen_task
      desc "Generate a skeleton spec.  Give the spec name as a task arg -- i.e. shen:generate[commands]."
      task('shen:generate', :basename) do |t, args|
        generate_spec args.basename
      end
    end
  end
end
