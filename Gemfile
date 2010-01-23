disable_system_gems
bin_path 'gem_bin'

gem 'sinatra', '>= 0.9.2'
gem 'haml', '>= 2.0.9'
gem 'rake'
gem 'rails', '>= 2.1.0'
gem 'compass'

only :development do
  gem 'rspec', '= 1.2.8'
  gem 'rack-test', '>= 0.3.0'
  gem 'hpricot', '>= 0.8.1'
  gem 'rspec_hpricot_matchers', '>= 1.0.0'
  gem 'braid', '>= 0.5.0'
  gem 'cucumber', '~> 0.6.0'
  gem 'ci_reporter', '~> 1.6.0'
  gem 'jeweler'
  gem 'thin' # needed because webrick doesn't handle SIGTERM correctly
  gem 'rails', '2.3.5' # this is the version the cucumber tests use

  # These are the dependencies for the vendored buildr (used for testing)
  gem 'rake', '= 0.8.7'
  gem 'builder', '= 2.1.2'
  gem 'net-ssh', '= 2.0.15'
  gem 'net-sftp', '= 2.0.2'
  gem 'rubyzip', '= 0.9.1'
  gem 'highline', '= 1.5.1'
  gem 'rubyforge', '= 1.0.5'
  gem 'hoe', '= 2.3.3'
  gem 'rjb', '= 1.1.9'
  gem 'Antwrap', '= 0.7.0'
  gem 'xml-simple', '= 1.0.12'
  gem 'archive-tar-minitar', '= 0.5.2'
end
