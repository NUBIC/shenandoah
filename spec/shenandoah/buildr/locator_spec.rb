require File.expand_path(File.dirname(__FILE__) + '/spec_helper')
require 'fileutils'

require 'shenandoah/buildr/locator'

describe Shenandoah::Buildr::Locator do
  include Shenandoah::Spec::Tmpfile

  before do
    @project = define('sample', :base_dir => tmpdir)
    @loc = Shenandoah::Buildr::Locator.new(@project)
  end

  it "resolves the specs from the base dir" do
    @loc.spec_path.should == "#{tmpdir}/src/spec/javascript"
  end
  
  it "resolves the main source from src main" do
    @loc.main_path.should == "#{tmpdir}/src/main/javascript"
  end
  
  it "uses a path under target for tmp" do
    @loc.tmp_path.should == "#{tmpdir}/target/shenandoah"
  end
  
  it "allows main to be overriden with test.using" do |variable|
    p = define('another', :base_dir => tmpdir) do
      test.using :main_path => "foo"
    end
    
    Shenandoah::Buildr::Locator.new(p).main_path.should == "foo"
  end
end
