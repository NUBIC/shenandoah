require 'rubygems'
require 'rake'

begin
  require 'jeweler'
  Jeweler::Tasks.new do |gem|
    gem.name = "shenandoah"
    gem.summary = %Q{A javascript test framework for buildr, rails, and other ruby-built projects}
    gem.email = "rhett@detailedbalance.net"
    gem.homepage = "http://github.com/rsutphin/shenandoah"
    gem.authors = ["Rhett Sutphin"]
    gem.rubyforge_project = "detailedbalance"

    # Exclude test-only vendored buildr
    gem.files.exclude("vendor/**/*")

    gem.add_runtime_dependency('sinatra', '>= 0.9.2')
    gem.add_runtime_dependency('haml', '>= 2.0.9')
    gem.add_runtime_dependency('rake')
    gem.add_runtime_dependency('rails', '>= 2.1.0')

    # Have to use rspec 1.2.4 for buildr compat
    gem.add_development_dependency('rspec', '= 1.2.4')
    gem.add_development_dependency('rack-test', '>= 0.3.0')
    gem.add_development_dependency('hpricot', '>= 0.8.1')
    gem.add_development_dependency('rspec_hpricot_matchers', '>= 1.0.0')
    gem.add_development_dependency('braid', '>= 0.5.0')
    
    # These are the dependencies for the vendored buildr (used for testing)
    gem.add_development_dependency('rake', '= 0.8.4')
    gem.add_development_dependency('net-ssh', '= 2.0.11')
    gem.add_development_dependency('net-sftp', '= 2.0.2')
    gem.add_development_dependency('highline', '= 1.5.0')
    gem.add_development_dependency('hoe', '= 1.12.2')
    gem.add_development_dependency('rubyzip', '= 0.9.1')
    gem.add_development_dependency('builder', '= 2.1.2')
    gem.add_development_dependency('rubyforge', '= 1.0.3')
    gem.add_development_dependency('rjb', '= 1.1.6')
    gem.add_development_dependency('Antwrap', '= 0.7.0')
    gem.add_development_dependency('xml-simple', '= 1.0.12')
    gem.add_development_dependency('archive-tar-minitar', '= 0.5.2')
  end

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

task :default => :spec

require 'rake/rdoctask'
Rake::RDocTask.new do |rdoc|
  if File.exist?('VERSION.yml')
    config = YAML.load(File.read('VERSION.yml'))
    version = "#{config[:major]}.#{config[:minor]}.#{config[:patch]}"
  else
    version = ""
  end

  rdoc.rdoc_dir = 'rdoc'
  rdoc.title = "shenandoah #{version}"
  rdoc.rdoc_files.include('README*')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

