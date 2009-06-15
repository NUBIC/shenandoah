# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{shenandoah}
  s.version = "0.0.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Rhett Sutphin"]
  s.date = %q{2009-06-14}
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
     "LICENSE",
     "LICENSE-Blue-Ridge",
     "LICENSE-Screw.Unit",
     "LICENSE-Smoke",
     "README.markdown",
     "Rakefile",
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
     "lib/shenandoah/runner.rb",
     "lib/shenandoah/server.rb",
     "lib/shenandoah/server/views/index.haml",
     "lib/shenandoah/tasks.rb",
     "spec/shenandoah/buildr/locator_spec.rb",
     "spec/shenandoah/buildr/shenandoah_tasks_spec.rb",
     "spec/shenandoah/buildr/spec_helper.rb",
     "spec/shenandoah/buildr/test_framework_spec.rb",
     "spec/shenandoah/locator_spec.rb",
     "spec/shenandoah/runner_spec.rb",
     "spec/shenandoah/server_spec.rb",
     "spec/shenandoah/tasks_spec.rb",
     "spec/spec_helper.rb"
  ]
  s.has_rdoc = true
  s.homepage = %q{http://github.com/rsutphin/shenandoah}
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{detailedbalance}
  s.rubygems_version = %q{1.3.1}
  s.summary = %q{A javascript test framework for buildr, rails, and other ruby-built projects}
  s.test_files = [
    "spec/shenandoah/buildr/locator_spec.rb",
     "spec/shenandoah/buildr/shenandoah_tasks_spec.rb",
     "spec/shenandoah/buildr/spec_helper.rb",
     "spec/shenandoah/buildr/test_framework_spec.rb",
     "spec/shenandoah/locator_spec.rb",
     "spec/shenandoah/runner_spec.rb",
     "spec/shenandoah/server_spec.rb",
     "spec/shenandoah/tasks_spec.rb",
     "spec/spec_helper.rb"
  ]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 2

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<sinatra>, [">= 0.9.2"])
      s.add_runtime_dependency(%q<haml>, [">= 2.0.9"])
      s.add_runtime_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<rspec>, ["= 1.2.4"])
      s.add_development_dependency(%q<rack-test>, [">= 0.3.0"])
      s.add_development_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
      s.add_development_dependency(%q<braid>, [">= 0.5.0"])
      s.add_development_dependency(%q<rake>, ["= 0.8.4"])
      s.add_development_dependency(%q<net-ssh>, ["= 2.0.11"])
      s.add_development_dependency(%q<net-sftp>, ["= 2.0.2"])
      s.add_development_dependency(%q<highline>, ["= 1.5.0"])
      s.add_development_dependency(%q<hoe>, ["= 1.12.2"])
    else
      s.add_dependency(%q<sinatra>, [">= 0.9.2"])
      s.add_dependency(%q<haml>, [">= 2.0.9"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rspec>, ["= 1.2.4"])
      s.add_dependency(%q<rack-test>, [">= 0.3.0"])
      s.add_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
      s.add_dependency(%q<braid>, [">= 0.5.0"])
      s.add_dependency(%q<rake>, ["= 0.8.4"])
      s.add_dependency(%q<net-ssh>, ["= 2.0.11"])
      s.add_dependency(%q<net-sftp>, ["= 2.0.2"])
      s.add_dependency(%q<highline>, ["= 1.5.0"])
      s.add_dependency(%q<hoe>, ["= 1.12.2"])
    end
  else
    s.add_dependency(%q<sinatra>, [">= 0.9.2"])
    s.add_dependency(%q<haml>, [">= 2.0.9"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rspec>, ["= 1.2.4"])
    s.add_dependency(%q<rack-test>, [">= 0.3.0"])
    s.add_dependency(%q<rspec_hpricot_matchers>, [">= 1.0.0"])
    s.add_dependency(%q<braid>, [">= 0.5.0"])
    s.add_dependency(%q<rake>, ["= 0.8.4"])
    s.add_dependency(%q<net-ssh>, ["= 2.0.11"])
    s.add_dependency(%q<net-sftp>, ["= 2.0.2"])
    s.add_dependency(%q<highline>, ["= 1.5.0"])
    s.add_dependency(%q<hoe>, ["= 1.12.2"])
  end
end
