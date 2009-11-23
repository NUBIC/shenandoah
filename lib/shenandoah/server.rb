require 'sinatra'
require 'haml'
require 'sass'
require 'compass'

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
    set :sass, Compass.sass_engine_options
    enable :logging

    get '/' do
      section_map = options.locator.spec_files.
        collect { |t| t.sub(%r{^#{options.locator.spec_path}/?}, '') }.
        collect { |t| [File.dirname(t), File.basename(t).sub(/_spec.js$/, '.html')] }.
        inject({}) { |h, (dir, file)| h[dir] ||= []; h[dir] << IndexEntry.new(dir, file); h }
      @sections = section_map.collect { |dir, files| [dir, files.sort] }.sort

      haml :index
    end

    get '/multirunner' do
      haml :multirunner
    end

    get '/main/*' do
      map_file(options.locator.main_path, params[:splat].first, "Main")
    end

    get '/spec/*' do
      map_file(options.locator.spec_path, params[:splat].first, "Spec")
    end

    get '/shenandoah.css' do
      shenandoah_css = File.join(options.locator.spec_path, 'shenandoah.css')
      if File.exist?(shenandoah_css)
        send_file shenandoah_css
      else
        shenandoah_sass = File.join(options.locator.spec_path, 'shenandoah.sass')
        unless File.exist?(shenandoah_sass)
          shenandoah_sass = File.join(File.dirname(__FILE__), "css/shenandoah.sass")
        end
        content_type 'text/css'
        last_modified File.stat(shenandoah_sass).mtime
        sass File.read(shenandoah_sass)
      end
    end

    get '/screw.css' do
      uri = '/shenandoah.css'
      $stderr.puts "DEPRECATION NOTICE: Use #{uri} instead of /screw.css."
      status 301
      response['Location'] = uri
      "This URI is deprecated.  Use <a href='#{uri}'>#{uri}</a>."
    end

    get '/shenandoah/browser-runner.js' do
      maxtime, content = concatenate_files(runner_files)

      content_type 'text/javascript'
      last_modified maxtime
      content
    end

    get '/shenandoah/multirunner.js' do
      maxtime, content = concatenate_files(multirunner_files)

      content_type 'text/javascript'
      last_modified maxtime
      content
    end

    get '/js/*' do
      send_file File.join(File.dirname(__FILE__), "javascript/#{params[:splat].first}")
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

    def concatenate_files(files)
      maxtime = files.collect { |filename|
        File.stat("#{File.dirname(__FILE__)}/#{filename}").mtime
      }.max

      content = files.collect { |filename|
        [
          "\n//////\n////// #{filename}\n//////\n",
          File.read("#{File.dirname(__FILE__)}/#{filename}")
        ]
      }.flatten

      [maxtime, content]
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
        "javascript/browser/runner.js",
        "javascript/browser/multirunner-single.js"
      ]
    end

    def multirunner_files # :nodoc
      [
        "javascript/common/jquery-1.3.2.js",
        "javascript/common/jquery.parsequery.js",
        "javascript/browser/multirunner.js"
      ]
    end

    class IndexEntry < Struct.new(:section, :test_html)
      def href
        '/' + ["spec", section, test_html].reject { |s| s == '.' }.join('/')
      end

      def name
        test_html.sub(/.html$/, '')
      end

      def <=>(other)
        self.test_html <=> other.test_html
      end
    end
  end
end