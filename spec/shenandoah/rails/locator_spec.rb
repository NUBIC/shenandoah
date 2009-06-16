require File.expand_path(File.dirname(__FILE__) + "/../../spec_helper")

require 'shenandoah/rails/locator'

describe Shenandoah::Rails::Locator do
  include Shenandoah::Spec::Tmpfile
  
  before do
    RAILS_ROOT = tmpdir('rails-root')
  end
  
  after do
    Object.instance_eval { remove_const :RAILS_ROOT }
  end
  
  def loc(*args)
    Shenandoah::Rails::Locator.new(*args)
  end
  
  describe "#main_path" do
    it "uses public/javascripts by default" do
      loc.main_path.should == "#{tmpdir}/rails-root/public/javascripts"
    end
    
    it "accepts an override relative to root" do
      loc(:main_path => "app/javascript").main_path.
        should == "#{tmpdir}/rails-root/app/javascript"
    end
  end
  
  describe "#spec_path" do
    it "uses test/javascript for spec by default" do
      loc.spec_path.should == "#{tmpdir}/rails-root/test/javascript"
    end

    it "uses spec/javascript for spec if spec/ already exists" do
      tmpdir('rails-root/spec')
      loc.spec_path.should == "#{tmpdir}/rails-root/spec/javascript"
    end

    it "uses examples/javascript for spec if examples/ already exists" do
      tmpdir('rails-root/examples')
      loc.spec_path.should == "#{tmpdir}/rails-root/examples/javascript"
    end
    
    it "accepts an override relative to root" do
      loc(:spec_path => "features/javascript").spec_path.
        should == "#{tmpdir}/rails-root/features/javascript"
    end
  end
  
  describe "#tmp_path" do
    it "uses the rails tmp directory" do
      loc.tmp_path.should == "#{tmpdir}/rails-root/tmp/shenandoah"
    end
  end
end
