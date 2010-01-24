require 'vendor/gems/environment'

require 'rake'
require 'ci/reporter/rake/rspec'

begin
  require 'jeweler'
  Jeweler::Tasks.new do |gem|
    gem.name = "shenandoah"
    gem.summary = %Q{A javascript test framework for buildr, rails, and other ruby-built projects}
    gem.email = "rhett@detailedbalance.net"
    gem.homepage = "http://github.com/rsutphin/shenandoah"
    gem.authors = ["Rhett Sutphin"]
    gem.rubyforge_project = "detailedbalance"

    # Exclude test-only vendored buildr & bundled gems
    gem.files.exclude("vendor/**/*")
    gem.files.exclude("gem_bin/*")

    # TODO: submit this to jeweler
    (Class.new do
      def initialize(gemspec)
        @gem = gemspec
        instance_eval File.read('Gemfile')
      end

      def method_missing(msg, *args)
        # skip unimplemented bits
      end

      def gem(*args)
        if @only && @only.include?(:development)
          @gem.add_development_dependency(*args)
        else
          @gem.add_runtime_dependency(*args)
        end
      end

      def only(*kinds)
        @only = kinds
        yield
        @only = nil
      end
    end).new(gem)
  end

  Jeweler::GemcutterTasks.new
  Jeweler::RubyforgeTasks.new
rescue LoadError
  puts "Jeweler (or a dependency) not available. Install it with: sudo gem install jeweler"
end

require 'spec/rake/spectask'
Spec::Rake::SpecTask.new(:spec) do |spec|
  spec.libs << 'lib' << 'spec'
  spec.verbose = true
  spec.spec_files = FileList['spec/**/*_spec.rb']
end

Spec::Rake::SpecTask.new(:rcov) do |spec|
  spec.libs << 'lib' << 'spec'
  spec.pattern = 'spec/**/*_spec.rb'
  spec.rcov = true
  # rcov can't tell that /Library/Ruby is a system path
  spec.rcov_opts = ['--exclude', "spec/*,/Library/Ruby/*"]
end

begin
  require 'cucumber'
  require 'cucumber/rake/task'

  Cucumber::Rake::Task.new(:features) do |t|
    t.cucumber_opts = "features --format pretty"
  end
rescue LoadError
  desc 'Cucumber rake task not available'
  task :features do
    abort 'Cucumber rake task is not available. Be sure to install cucumber as a gem or plugin'
  end
end

task :default => :spec

def version
  if File.exist?('VERSION.yml')
    config = YAML.load(File.read('VERSION.yml'))
    "#{config[:major]}.#{config[:minor]}.#{config[:patch]}"
  else
    ""
  end
end

require 'rake/rdoctask'
Rake::RDocTask.new do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title = "shenandoah #{version}"
  rdoc.rdoc_files.include('README*')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

desc "Uninstall the current (development) version of the gem"
task :uninstall do |t|
  system("sudo gem uninstall shenandoah -v #{version}")
end

# Disable github release since I don't want to commit the gemspec
Rake::Task[:release].prerequisites.delete 'github:release'
# Disable rubyforge releasing, but keep rdoc deployment task
Rake::Task[:release].prerequisites.delete 'rubyforge:release'

task :build => [:gemspec]
task :install => [:uninstall]

namespace :ci do
  ENV["CI_REPORTS"] ||= "reports/spec-xml"

  task :all => [:features, :spec]

  Spec::Rake::SpecTask.new(:spec => :"ci:setup:rspec") do |spec|
    spec.libs << 'lib' << 'spec'
    spec.verbose = true
    spec.spec_files = FileList['spec/**/*_spec.rb']
  end

  Cucumber::Rake::Task.new(:features) do |t|
    t.cucumber_opts = "features --format progress --strict --format junit --out reports/cucumber-xml --format html --out reports/features.html"
  end
end
