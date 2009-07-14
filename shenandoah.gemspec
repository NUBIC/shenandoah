# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{shenandoah}
  s.version = "0.1.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Rhett Sutphin"]
  s.date = %q{2009-07-14}
  s.email = %q{rhett@detailedbalance.net}
  s.extra_rdoc_files = [
    "ChangeLog.markdown",
     "LICENSE",
     "LICENSE-Blue-Ridge",
     "LICENSE-Screw.Unit",
     "LICENSE-Smoke",
     "README.markdown"
  ]
  s.files = [
    ".braids",
     ".document",
     ".gitignore",
     "ChangeLog.markdown",
     "LICENSE",
     "LICENSE-Blue-Ridge",
     "LICENSE-Screw.Unit",
     "LICENSE-Smoke",
     "README.markdown",
     "Rakefile",
     "VERSION.yml",
     "lib/shenandoah/buildr.rb",
     "lib/shenandoah/buildr/locator.rb",
     "lib/shenandoah/buildr/shenandoah_tasks.rb",
     "lib/shenandoah/buildr/test_framework.rb",
     "lib/shenandoah/css/screw.css",
     "lib/shenandoah/javascript/browser/runner.js",
     "lib/shenandoah/javascript/common/jquery-1.3.2.js",
     "lib/shenandoah/javascript/common/jquery.fn.js",
     "lib/shenandoah/javascript/common/jquery.print.js",
     "lib/shenandoah/javascript/common/screw.behaviors.js",
     "lib/shenandoah/javascript/common/screw.builder.js",
     "lib/shenandoah/javascript/common/screw.events.js",
     "lib/shenandoah/javascript/common/screw.matchers.js",
     "lib/shenandoah/javascript/common/screw.mocking.js",
     "lib/shenandoah/javascript/common/smoke.core.js",
     "lib/shenandoah/javascript/common/smoke.mock.js",
     "lib/shenandoah/javascript/common/smoke.stub.js",
     "lib/shenandoah/javascript/console/consoleReportForRake.js",
     "lib/shenandoah/javascript/console/env.rhino.js",
     "lib/shenandoah/javascript/console/js.jar",
     "lib/shenandoah/javascript/console/runner.js",
     "lib/shenandoah/javascript/console/shell.js.erb",
     "lib/shenandoah/locator.rb",
     "lib/shenandoah/rails/locator.rb",
     "lib/shenandoah/rails/tasks.rb",
     "lib/shenandoah/runner.rb",
     "lib/shenandoah/server.rb",
     "lib/shenandoah/server/views/index.haml",
     "lib/shenandoah/tasks.rb",
     "rails_generators/shen_spec/shen_spec_generator.rb",
     "rails_generators/shen_spec/templates/fixture.html.erb",
     "rails_generators/shen_spec/templates/javascript_spec.js.erb",
     "rails_generators/shenandoah/shenandoah_generator.rb",
     "rails_generators/shenandoah/templates/application.html",
     "rails_generators/shenandoah/templates/application_spec.js",
     "rails_generators/shenandoah/templates/shenandoah.rake",
     "rails_generators/shenandoah/templates/spec_helper.js",
     "shenandoah.gemspec",
     "spec/rails_generators/shen_spec_generator_spec.rb",
     "spec/rails_generators/shenandoah_generator_spec.rb",
     "spec/rails_generators/spec_helper.rb",
     "spec/shenandoah/buildr/locator_spec.rb",
     "spec/shenandoah/buildr/shenandoah_tasks_spec.rb",
     "spec/shenandoah/buildr/spec_helper.rb",
     "spec/shenandoah/buildr/test_framework_spec.rb",
     "spec/shenandoah/locator_spec.rb",
     "spec/shenandoah/rails/locator_spec.rb",
     "spec/shenandoah/rails/tasks_spec.rb",
     "spec/shenandoah/runner_spec.rb",
     "spec/shenandoah/server_spec.rb",
     "spec/shenandoah/tasks_spec.rb",
     "spec/spec_helper.rb"
  ]
  s.homepage = %q{http://github.com/rsutphin/shenandoah}
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{detailedbalance}
  s.rubygems_version = %q{1.3.4}
  s.summary = %q{A javascript test framework for buildr, rails, and other ruby-built projects}
  s.test_files = [
    "spec/rails_generators/shen_spec_generator_spec.rb",
     "spec/rails_generators/shenandoah_generator_spec.rb",
     "spec/rails_generators/spec_helper.rb",
     "spec/shenandoah/buildr/locator_spec.rb",
     "spec/shenandoah/buildr/shenandoah_tasks_spec.rb",
     "spec/shenandoah/buildr/spec_helper.rb",
     "spec/shenandoah/buildr/test_framework_spec.rb",
     "spec/shenandoah/locator_spec.rb",
     "spec/shenandoah/rails/locator_spec.rb",
     "spec/shenandoah/rails/tasks_spec.rb",
     "spec/shenandoah/runner_spec.rb",
     "spec/shenandoah/server_spec.rb",
     "spec/shenandoah/tasks_spec.rb",
     "spec/spec_helper.rb"
  ]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<sinatra>, [">= 0.9.2"])
      s.add_runtime_dependency(%q<haml>, [">= 2.0.9"])
      s.add_runtime_dependency(%q<rake>, [">= 0"])
      s.add_runtime_dependency(%q<rails>, [">= 2.1.0"])
      s.add_development_dependency(%q<rspec>, ["= 1.2.4"])
      s.add_development_dependency(%q<rack-test>, [">= 0.3.0"])
      s.add_development_dependency(%q<hpricot>, [">= 0.8.1"])
      s.add_development_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
      s.add_development_dependency(%q<braid>, [">= 0.5.0"])
      s.add_development_dependency(%q<rake>, ["= 0.8.4"])
      s.add_development_dependency(%q<net-ssh>, ["= 2.0.11"])
      s.add_development_dependency(%q<net-sftp>, ["= 2.0.2"])
      s.add_development_dependency(%q<highline>, ["= 1.5.0"])
      s.add_development_dependency(%q<hoe>, ["= 1.12.2"])
      s.add_development_dependency(%q<rubyzip>, ["= 0.9.1"])
      s.add_development_dependency(%q<builder>, ["= 2.1.2"])
      s.add_development_dependency(%q<rubyforge>, ["= 1.0.3"])
      s.add_development_dependency(%q<rjb>, ["= 1.1.6"])
      s.add_development_dependency(%q<Antwrap>, ["= 0.7.0"])
      s.add_development_dependency(%q<xml-simple>, ["= 1.0.12"])
      s.add_development_dependency(%q<archive-tar-minitar>, ["= 0.5.2"])
    else
      s.add_dependency(%q<sinatra>, [">= 0.9.2"])
      s.add_dependency(%q<haml>, [">= 2.0.9"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rails>, [">= 2.1.0"])
      s.add_dependency(%q<rspec>, ["= 1.2.4"])
      s.add_dependency(%q<rack-test>, [">= 0.3.0"])
      s.add_dependency(%q<hpricot>, [">= 0.8.1"])
      s.add_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
      s.add_dependency(%q<braid>, [">= 0.5.0"])
      s.add_dependency(%q<rake>, ["= 0.8.4"])
      s.add_dependency(%q<net-ssh>, ["= 2.0.11"])
      s.add_dependency(%q<net-sftp>, ["= 2.0.2"])
      s.add_dependency(%q<highline>, ["= 1.5.0"])
      s.add_dependency(%q<hoe>, ["= 1.12.2"])
      s.add_dependency(%q<rubyzip>, ["= 0.9.1"])
      s.add_dependency(%q<builder>, ["= 2.1.2"])
      s.add_dependency(%q<rubyforge>, ["= 1.0.3"])
      s.add_dependency(%q<rjb>, ["= 1.1.6"])
      s.add_dependency(%q<Antwrap>, ["= 0.7.0"])
      s.add_dependency(%q<xml-simple>, ["= 1.0.12"])
      s.add_dependency(%q<archive-tar-minitar>, ["= 0.5.2"])
    end
  else
    s.add_dependency(%q<sinatra>, [">= 0.9.2"])
    s.add_dependency(%q<haml>, [">= 2.0.9"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rails>, [">= 2.1.0"])
    s.add_dependency(%q<rspec>, ["= 1.2.4"])
    s.add_dependency(%q<rack-test>, [">= 0.3.0"])
    s.add_dependency(%q<hpricot>, [">= 0.8.1"])
    s.add_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
    s.add_dependency(%q<braid>, [">= 0.5.0"])
    s.add_dependency(%q<rake>, ["= 0.8.4"])
    s.add_dependency(%q<net-ssh>, ["= 2.0.11"])
    s.add_dependency(%q<net-sftp>, ["= 2.0.2"])
    s.add_dependency(%q<highline>, ["= 1.5.0"])
    s.add_dependency(%q<hoe>, ["= 1.12.2"])
    s.add_dependency(%q<rubyzip>, ["= 0.9.1"])
    s.add_dependency(%q<builder>, ["= 2.1.2"])
    s.add_dependency(%q<rubyforge>, ["= 1.0.3"])
    s.add_dependency(%q<rjb>, ["= 1.1.6"])
    s.add_dependency(%q<Antwrap>, ["= 0.7.0"])
    s.add_dependency(%q<xml-simple>, ["= 1.0.12"])
    s.add_dependency(%q<archive-tar-minitar>, ["= 0.5.2"])
  end
end
