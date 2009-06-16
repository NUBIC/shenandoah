require File.expand_path(File.dirname(__FILE__) + "/../../spec_helper")

require 'shenandoah/locator'
require 'shenandoah/rails/locator'
require 'shenandoah/rails/tasks'

describe Shenandoah::Rails::Tasks do
  include Shenandoah::Spec::Tmpfile
  
  before do
    RAILS_ROOT = tmpdir('rails')
  end

  after do
    Object.instance_eval { remove_const :RAILS_ROOT }
  end

  it "uses a rails locator by default" do
    Shenandoah::Rails::Tasks.new.locator.class.
      should == Shenandoah::Rails::Locator
  end

  it "passes overrides to the rails locator" do
    Shenandoah::Rails::Tasks.new(:main_path => "app/js").locator.
      main_path.should == "#{tmpdir}/rails/app/js"
  end

  it "uses the explicitly provided locator over all others" do
    loc = Shenandoah::DefaultLocator.new(:main_path => 'foo')
    Shenandoah::Rails::Tasks.new(:locator => loc).locator.main_path.should == 'foo'
  end
end