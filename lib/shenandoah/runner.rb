require 'fileutils'

module Shenandoah
  class Runner
    include FileUtils
    
    def initialize(locator, options = {})
      @locator = locator
      @quiet = options[:quiet]
    end
    
    # Runs the specified specs.  Returns an array of the specs that passed.
    def run_console(specs)
      cd @locator.spec_path do
        runner_cmd = rhino_command(shen_path_to('lib/shenandoah/javascript/console/runner.js'))
        args = [
          shen_path_to,
          @locator.main_path,
          @locator.spec_path
        ]
        
        return specs.select { |spec| 
          system("#{runner_cmd} '#{args.join("' '")}' '#{spec.sub(%r{^#{@locator.spec_path}/}, '')}' #{@quiet ? '> /dev/null' : ''}") 
        }
      end
    end
    
    private
    
    def shen_path_to(file=nil)
      File.expand_path(File.dirname(__FILE__) + "/../../#{file}")
    end
    
    def rhino_command(*args)
      "java -jar '#{shen_path_to 'lib/shenandoah/javascript/console/js.jar'}' -w -debug '#{args.join("' '")}'"
    end
  end
end
