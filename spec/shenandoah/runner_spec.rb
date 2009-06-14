require File.expand_path(File.dirname(__FILE__) + "/../spec_helper")
require 'erb'
require 'open3'

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
    %w(spec main).each { |d| FileUtils.mkdir_p "#{tmpdir}/#{d}" }
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

  describe "#run_shell" do
    before do
      script_contents = ERB.new(<<-RUBY).result(binding)
        # This is a small script to invoke Runner#run_shell so that it's
        # input and output can be controlled for testing
        <% $LOAD_PATH.select { |p| p =~ /shenandoah/ }.each do |p| %>
          $LOAD_PATH.unshift(<%= p.inspect %>)
        <% end %>
        require 'rubygems'
        require 'shenandoah/runner'
        require 'shenandoah/locator'

        loc = Shenandoah::DefaultLocator.new(
          :main_path => <%= @locator.main_path.inspect %>,
          :spec_path => <%= @locator.spec_path.inspect %>,
          :tmp_path => <%= @locator.tmp_path.inspect %>
        )

        Shenandoah::Runner.new(loc).run_shell
      RUBY
      tmpfile "spec_shell.rb", script_contents
    end

    def run_shell(jslines)
      Open3.popen3("ruby #{tmpdir}/spec_shell.rb") do |stdin, stdout, stderr|
        stdin.write jslines
        stdin.close
        return stdout.read, stderr.read
      end
    end

    it "runs an interactive shell" do
      out, err = run_shell("1 + 1 + ' foo';\n")
      err.should =~ /2 foo/
    end

    it "prints a banner" do
      out, err = run_shell("quit();\n")
      out.should =~ / Rhino JavaScript Shell/
    end
  end
end
