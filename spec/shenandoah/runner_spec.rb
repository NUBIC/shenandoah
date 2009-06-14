require File.expand_path(File.dirname(__FILE__) + "/../spec_helper")

require 'shenandoah/locator'
require 'shenandoah/runner'

describe Shenandoah::Runner do
  include Shenandoah::Spec::Tmpfile
  
  before do
    @locator = Shenandoah::DefaultLocator.new(
      :spec_path => "#{tmpdir}/spec",
      :main_path => "#{tmpdir}/main",
      :tmp_path  => "#{tmpdir}/tmp"
    )
    @runner = Shenandoah::Runner.new(@locator, :quiet => true)
  end
  
  def add_good_spec
    @good = tmpfile "spec/good_spec.js", <<-JS
      Screw.Unit(function () {
        describe("good", function () {
          it("passes", function () {
            expect("good").to(equal, "good");
          });
        });
      })
    JS
    tmpfile "spec/good.html", <<-HTML
      <html><body></body></html>
    HTML
  end
  
  def add_bad_spec
    @bad = tmpfile "spec/bad_spec.js", <<-JS
      Screw.Unit(function () {
        describe("bad", function () {
          it("fails", function () {
            expect("bad").to(equal, "good");
          });
        });
      });
    JS
    tmpfile "spec/bad.html", <<-HTML
      <html><body></body></html>
    HTML
  end
  
  describe "#run_console" do
    it "runs passing specs" do
      add_good_spec
      @runner.run_console([@good]).should == [@good]
    end
    
    it "fails on bad specs" do
      add_bad_spec
      @runner.run_console([@bad]).should == []
    end
    
    it "runs all specs" do
      add_good_spec
      add_bad_spec
      @runner.run_console([@bad, @good]).should == [@good]
    end
  end
end