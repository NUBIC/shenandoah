require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

require 'shenandoah/tasks'
require 'shenandoah/locator'
require 'shenandoah/rails/locator'

describe Shenandoah::Tasks do
  describe "init" do
    include Shenandoah::Spec::Tmpfile
    
    it "uses a DefaultLocator by default" do
      Shenandoah::Tasks.new.locator.class.should == Shenandoah::DefaultLocator
    end

    it "configures the default locator with the provided options" do
      Shenandoah::Tasks.new(:main_path => 'foo').locator.main_path.should == 'foo'
    end
    
    it "uses an explictly provided locator, ignoring other options" do
      loc = Shenandoah::DefaultLocator.new(:main_path => 'bar')
      tasks = Shenandoah::Tasks.new(:locator => loc, :main_path => 'foo')
      tasks.locator.main_path.should == 'bar'
    end
  end

  after do
    Rake::Task.clear
  end

  describe "tasks" do
    before do
      Shenandoah::Tasks.new
    end

    it "adds a shen:serve task" do
      Rake::Task::task_defined?('shen:serve').should be_true
    end

    it "adds a shen:shell task" do
      Rake::Task::task_defined?('shen:shell').should be_true
    end

    it "adds a shen:spec task" do
      Rake::Task::task_defined?('shen:spec').should be_true
    end
  end

  describe "running" do
    before do
      @locator = mock(Shenandoah::DefaultLocator)
      @runner  = mock(Shenandoah::Runner)

      @tasks = Shenandoah::Tasks.new
      @tasks.locator = @locator
      @tasks.runner  = @runner
    end

    after do
      ENV.delete 'SHEN_SPEC'
    end

    it "runs all the specs without ENV['SHEN_SPEC']" do
      @locator.should_receive(:spec_files).and_return(%w(a b c))
      @runner.should_receive(:run_console).with(%w(a b c)).and_return(%w(a b c))

      @tasks.run_specs
    end

    it "only runs the specs matching ENV['SHEN_SPEC']" do
      ENV['SHEN_SPEC'] = "b"

      @locator.should_receive(:spec_files).and_return(%w(ab bc cd))
      @runner.should_receive(:run_console).with(%w(ab bc)).and_return(%w(ab bc))

      @tasks.run_specs
    end

    it "throws an exception on failure" do
      @locator.should_receive(:spec_files).and_return(%w(a b c))
      @runner.should_receive(:run_console).with(%w(a b c)).and_return(%w(a b))

      lambda { @tasks.run_specs }.should raise_error(/Shenandoah specs failed!/)
    end
  end
end