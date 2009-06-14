require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

require 'shenandoah/buildr'

describe Buildr::JavaScript::Shenandoah do
  include Shenandoah::Spec::Tmpfile

  def js_proj(&block)
    define('js-proj', :base_dir => "#{self.tmpdir}/js-proj") do
      test.using :quiet => true
      if block
        instance_eval(&block)
      end
    end
    project('js-proj')
  end

  before do
    @other_proj = define('other-proj', :base_dir => "#{tmpdir}/other-proj")
    @good = tmpfile "js-proj/src/spec/javascript/good_spec.js", <<-JS
      Screw.Unit(function () {
        describe("success", function () {
          it("passes", function () {
            expect(true).to(be_true);
          });
        });
      });
    JS
    tmpfile "js-proj/src/spec/javascript/good.html", <<-HTML
      <html><body></body></html>
    HTML
  end

  it "applies to a project with js specs" do
    Buildr::JavaScript::Shenandoah.applies_to?(js_proj).should be_true
  end

  it "does not apply to a project without specs" do
    Buildr::JavaScript::Shenandoah.applies_to?(@other_proj).should be_false
  end

  it "is automatically used for a project with js specs" do
    js_proj do
      test.framework.should == :shenandoah
    end
  end

  it "executes passing specs" do
    good = @good
    js_proj do
      test.invoke
      test.passed_tests.should == [good]
    end
  end

  it "executes failing specs" do
    bad = tmpfile "js-proj/src/spec/javascript/bad_spec.js", <<-JS
      Screw.Unit(function () {
        describe("failure", function () {
          it("fails", function () {
            expect(1).to(equal, 0)
          });
        });
      });
    JS
    tmpfile "js-proj/src/spec/javascript/bad.html", <<-HTML
      <html><body></body></html>
    HTML
    good = @good
    js_proj do
      lambda { test.invoke }.should raise_error(/Tests failed/)
      test.passed_tests.should == [good]
      test.failed_tests.should == [bad]
    end
  end

end