
Given /an empty rails project/ do
  switch_to_project('rails')
  system("rails . > /dev/null")

  File.open('config/initializers/shenandoh_dev.rb', 'w') do |f|
    f.write <<-RUBY
      require 'rails_generator'

      begin
        $LOAD_PATH.unshift(File.join(#{root_path.inspect}, 'lib'))

        Rails::Generator::Base.prepend_sources(
          Rails::Generator::PathSource.new(
            :shenandoah_dev, File.join(#{root_path.inspect}, 'rails_generators')))
      end
    RUBY
  end
end

Given /a rails project/ do
  Given "an empty rails project"

  File.open('lib/tasks/shenandoah.rake', 'w') do |f|
    f.write <<-RUBY
      begin
        $LOAD_PATH.unshift(File.join(#{root_path.inspect}, 'lib'))
      end

      require 'shenandoah/rails/tasks'
      Shenandoah::Rails::Tasks.new
    RUBY
  end

  mkdir "test/javascript"
  cp Dir["#{base_project}/lib/*"], "public/javascripts"
  cp Dir["#{base_project}/spec/*"], "test/javascript"
end
