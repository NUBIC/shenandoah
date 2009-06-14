require 'fileutils'
require 'erb'

module Shenandoah
  class Runner
    def initialize(locator, options = {})
      @locator = locator
      @quiet = options[:quiet]
    end

    # Runs the specified specs.  Returns an array of the specs that passed.
    def run_console(specs)
      FileUtils.cd @locator.spec_path do
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

    def run_shell
      create_shell_html
      create_shell_js

      rlwrap = `which rlwrap`.chomp
      cmd = "#{rlwrap} #{rhino_command('-f', shell_js_path, '-f', '-')}"
      $stderr.puts "Starting shell with #{cmd}"
      system(cmd)
    end

    private

    def shen_path_to(file=nil)
      File.expand_path(File.dirname(__FILE__) + "/../../#{file}")
    end
    alias :shenandoah_root :shen_path_to

    def rhino_command(*args)
      "java -jar '#{shen_path_to 'lib/shenandoah/javascript/console/js.jar'}' -w -debug '#{args.join("' '")}'"
    end

    def shell_html_path
      "#{@locator.tmp_path}/shell.html"
    end

    def shell_js_path
      "#{@locator.tmp_path}/shell.js"
    end

    def create_shell_html
      FileUtils.mkdir_p File.dirname(shell_html_path)
      File.open(shell_html_path, 'w') do |f|
        f.write "<html><body></body></html>"
      end
    end

    def create_shell_js
      js = ERB.new(File.read(shen_path_to('lib/shenandoah/javascript/console/shell.js.erb'))).result(binding)
      FileUtils.mkdir_p File.dirname(shell_js_path)
      File.open(shell_js_path, 'w') { |f| f.write js }
    end
  end
end
