Given /a buildr project/ do
  switch_to_project('buildr')

  open("buildfile", 'w') do |f|
    f.write <<-RUBY
      repositories.remote << 'http://repo1.maven.org/maven2'

      $LOAD_PATH.unshift(File.join(#{root_path.inspect}, 'lib'))
      require 'shenandoah/buildr'

      define 'life' do
        test.using :shenandoah
      end
    RUBY
  end

  mkdir_p 'src/main/javascript'
  cp Dir["#{base_project}/lib/**/*"], 'src/main/javascript'

  mkdir_p 'src/spec/javascript'
  cp Dir["#{base_project}/spec/**/*"], 'src/spec/javascript'
end

When /^I list the available buildr tasks$/ do
  @tasks = `buildr help:tasks`.scan(/\n\s*(\S+)\s*#/).collect { |m| m.first }
  $?.should == 0
end

