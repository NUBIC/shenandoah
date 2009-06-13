require 'sinatra'
require 'haml'

module Shenandoah
  class Server < Sinatra::Base
    set :root, File.dirname(__FILE__) + "/server"
    # set :port, 4410

    get '/' do
      section_map = Dir["#{options.spec_path}/**/*_spec.js"].
        collect { |t| t.sub(%r{^#{options.spec_path}/?}, '') }.
        collect { |t| [File.dirname(t), File.basename(t).sub(/_spec.js$/, '.html')] }.
        inject({}) { |h, (dir, file)| h[dir] ||= []; h[dir] << file; h }
      @sections = section_map.collect { |dir, files| [dir, files.sort] }.sort
      
      haml :index
    end
    
    get '/main/*' do
      map_file(options.main_path, params[:splat].first, "Main")
    end

    get '/spec/*' do
      map_file(options.spec_path, params[:splat].first, "Spec")
    end

    def map_file(path, name, desc)
      file = File.join(path, name)
      if File.exist?(file)
        headers['Cache-Control'] = 'no-cache'
        send_file file
      else
        halt 404, "#{desc} file not found: #{file}"
      end
    end

    get '/screw.css' do
      screw_css = File.join(options.spec_path, 'screw.css')
      unless File.exist?(screw_css)
        screw_css = File.join(File.dirname(__FILE__), 'css/screw.css')
      end
      send_file screw_css
    end

    get '/shenandoah/browser-runner.js' do
      content_type 'text/javascript'

      last_modified self.class.runner_files.collect { |filename|
        File.stat("#{File.dirname(__FILE__)}/#{filename}").mtime
      }.max

      self.class.runner_files.collect { |filename|
        [
          "\n//////\n////// #{filename}\n//////\n",
          File.read("#{File.dirname(__FILE__)}/#{filename}")
        ]
      }.flatten
    end

    def self.runner_files
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