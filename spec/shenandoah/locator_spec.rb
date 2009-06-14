require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

require 'shenandoah/locator'

describe Shenandoah::DefaultLocator do
  include Shenandoah::Spec::Tmpfile

  describe "default attributes" do
    before do
      ENV['TMPDIR'] = nil
      @loc = Shenandoah::DefaultLocator.new
    end

    it "has main_path = lib" do
      @loc.main_path.should == "lib"
    end

    it "has spec_path = spec" do
      @loc.spec_path.should == "spec"
    end

    it "uses the TMPDIR env var for tmp" do
      ENV['TMPDIR'] = "/var/tmp"
      Shenandoah::DefaultLocator.new.tmp_path.should == "/var/tmp"
    end

    it "has tmp_path = tmp" do
      @loc.tmp_path.should == "tmp"
    end
  end

  describe "initializing from options" do
    it "uses an explicit main path" do
      Shenandoah::DefaultLocator.new(:main_path => 'main').main_path.should == 'main'
    end

    it "uses an explicit spec path" do
      Shenandoah::DefaultLocator.new(:spec_path => 'foo').spec_path.should == 'foo'
    end

    it "uses an explicit tmp path" do
      Shenandoah::DefaultLocator.new(:tmp_path => 'foo').tmp_path.should == 'foo'
    end
  end

  describe "finding specs" do
    before do
      @loc = Shenandoah::DefaultLocator.new :spec_path => "#{tmpdir}/spec"
    end

    it "finds specs directly in spec_path" do
      tmpfile "spec/common_spec.js"
      @loc.spec_files.should == ["#{tmpdir}/spec/common_spec.js"]
    end

    it "finds specs in subdirs" do
      tmpfile "spec/foo/bar_spec.js"
      @loc.spec_files.should == ["#{tmpdir}/spec/foo/bar_spec.js"]
    end

    it "only finds specs" do
      tmpfile "spec/quux.js"
      tmpfile "spec/foo/bar_spec.js"
      @loc.spec_files.should == ["#{tmpdir}/spec/foo/bar_spec.js"]
    end

    it "doesn't cache results" do
      tmpfile "spec/bar/etc_spec.js"
      @loc.should have(1).spec_files
      tmpfile "spec/bar/quux_spec.js"
      @loc.should have(2).spec_files
    end
  end
end
