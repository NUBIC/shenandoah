require 'sinatra'
require 'haml'

module Shenandoah
  # The server which enables in-browser execution of Screw.Unit specs in
  # Shenandoah.
  #
  # It exposes a list of all the specs at the root of the server, 
  # organized by subdirectory, with links to individual test fixtures.
  # The contents of the +main_path+ and +spec_path+ in the configured locator
  # are exposed under <tt>/main</tt> and <tt>/spec</tt> respectively.
  class Server < Sinatra::Base
    set :root, File.dirname(__FILE__) + "/server"
    set :port, 4410
    enable :logging

    get '/' do
      section_map = options.locator.spec_files.
        collect { |t| t.sub(%r{^#{options.locator.spec_path}/?}, '') }.
        collect { |t| [File.dirname(t), File.basename(t).sub(/_spec.js$/, '.html')] }.
        inject({}) { |h, (dir, file)| h[dir] ||= []; h[dir] << file; h }
      @sections = section_map.collect { |dir, files| [dir, files.sort] }.sort
      
      haml :index
    end
    
    get '/main/*' do
      map_file(options.locator.main_path, params[:splat].first, "Main")
    end

    get '/spec/*' do
      map_file(options.locator.spec_path, params[:splat].first, "Spec")
    end

    get '/screw.css' do
      screw_css = File.join(options.locator.spec_path, 'screw.css')
      unless File.exist?(screw_css)
        screw_css = File.join(File.dirname(__FILE__), 'css/screw.css')
      end
      send_file screw_css
    end

    get '/shenandoah/browser-runner.js' do
      content_type 'text/javascript'

      last_modified runner_files.collect { |filename|
        File.stat("#{File.dirname(__FILE__)}/#{filename}").mtime
      }.max

      runner_files.collect { |filename|
        [
          "\n//////\n////// #{filename}\n//////\n",
          File.read("#{File.dirname(__FILE__)}/#{filename}")
        ]
      }.flatten
    end

    protected

    def map_file(path, name, desc) # :nodoc:
      file = File.join(path, name)
      if File.exist?(file)
        headers['Cache-Control'] = 'no-cache'
        send_file file
      else
        halt 404, "#{desc} file not found: #{file}"
      end
    end

    def runner_files # :nodoc:
      # Can't just use Dir[] because order is important
      [
        "javascript/common/jquery-1.3.2.js",
        "javascript/common/jquery.fn.js",
        "javascript/common/jquery.print.js",
        "javascript/common/screw.builder.js",
        "javascript/common/screw.matchers.js",
        "javascript/common/screw.events.js",
        "javascript/common/screw.behaviors.js",
        "javascript/common/smoke.core.js",
        "javascript/common/smoke.mock.js",
        "javascript/common/smoke.stub.js",
        "javascript/common/screw.mocking.js",
        "javascript/browser/runner.js"
      ]
    end
  end
end