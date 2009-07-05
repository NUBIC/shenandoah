require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

require 'shenandoah/locator'

describe Shenandoah::DefaultLocator do
  include Shenandoah::Spec::Tmpfile

  describe "default attributes" do
    before do
      ENV['TMPDIR'] = nil
      @loc = Shenandoah::DefaultLocator.new
    end

    it "has main_path = `pwd`/lib" do
      @loc.main_path.should == File.join(FileUtils.pwd, "lib")
    end

    it "has spec_path = `pwd`/spec" do
      @loc.spec_path.should == File.join(FileUtils.pwd, "spec")
    end

    it "uses the TMPDIR env var for tmp" do
      ENV['TMPDIR'] = "/var/tmp"
      Shenandoah::DefaultLocator.new.tmp_path.should == "/var/tmp"
    end

    it "has tmp_path = tmp" do
      @loc.tmp_path.should == File.join(FileUtils.pwd, "tmp")
    end
  end

  describe "initializing from options" do
    it "uses an explicit main path" do
      Shenandoah::DefaultLocator.new(:main_path => '/main').main_path.should == '/main'
    end

    it "uses an explicit spec path" do
      Shenandoah::DefaultLocator.new(:spec_path => '/foo').spec_path.should == '/foo'
    end

    it "uses an explicit tmp path" do
      Shenandoah::DefaultLocator.new(:tmp_path => '/foo/tmp').tmp_path.should == '/foo/tmp'
    end

    describe "with relative paths" do
      %w(main_path spec_path tmp_path).each do |kind|
        k = kind.to_sym
        it "absolutizes #{kind} against the working directory" do
          Shenandoah::DefaultLocator.new(k => 'bar').send(k).should == 
            File.join(FileUtils.pwd, 'bar')
        end
      end
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
