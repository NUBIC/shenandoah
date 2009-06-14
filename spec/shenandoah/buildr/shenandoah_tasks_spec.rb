require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

require 'shenandoah/buildr'

describe Buildr::JavaScript::ShenandoahTasks do
  before do
    define("js") do
      test.using :shenandoah
    end

    define("java") do
      test.using :junit
    end
  end

  it "leaves non-shenandoah projects alone" do
    Rake::Task.task_defined?("java:shen:serve").should be_false
  end

  it "adds a server task" do
    Rake::Task.task_defined?("js:shen:serve").should be_true
  end

  it "adds a shell task" do
    Rake::Task.task_defined?("js:shen:shell").should be_true
  end
end
