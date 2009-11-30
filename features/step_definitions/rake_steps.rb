require 'open-uri'

Given /^a plain-rake project$/ do
  cd base_project
end

Given /^an empty plain-rake project$/ do
  switch_to_project('starter')
  cp "#{base_project}/Rakefile", "Rakefile"
end

When /^I list the available rake tasks$/ do
  @tasks = `rake -T`.scan(/rake (\S+)/).collect { |m| m.first }
  $?.should == 0
end

Then /^the task list should (not )?include (\S+)$/ do |no, task_name|
  if no
    @tasks.should_not include(task_name)
  else
    @tasks.should include(task_name)
  end
end

Then %r{^(\d+) specs? should run$} do |count|
  @pipe.read.
    scan(/(\d+) test\(s\)/).
    collect { |matches| matches.first.to_i }.
    inject(0) { |s, i| s + i }.
    should == count.to_i
end

Then %r{^the server should be running$} do
  sleep 10
  open('http://localhost:4410/') { |f| f.read }.should_not be_nil
end

Then /^the (?:file|directory) "([^\"]*)" should exist$/ do |filename|
  @pipe.read if @pipe
  File.exist?(filename).should be_true
end
