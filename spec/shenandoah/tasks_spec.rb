require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

require 'shenandoah/tasks'
require 'shenandoah/locator'
require 'shenandoah/rails/locator'
require 'open3'

describe Shenandoah::Tasks do
  describe "init" do
    include Shenandoah::Spec::Tmpfile

    it "uses a DefaultLocator by default" do
      Shenandoah::Tasks.new.locator.class.should == Shenandoah::DefaultLocator
    end

    it "configures the default locator with the provided options" do
      Shenandoah::Tasks.new(:main_path => '/foo').locator.main_path.should == '/foo'
    end

    it "uses an explictly provided locator, ignoring other options" do
      loc = Shenandoah::DefaultLocator.new(:main_path => '/bar')
      tasks = Shenandoah::Tasks.new(:locator => loc, :main_path => 'foo')
      tasks.locator.main_path.should == '/bar'
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

    it "gives the shen:serve task a description" do
      Rake::Task['shen:serve'].full_comment.should ==
        "Start the in-browser JavaScript spec runner on http://localhost:4410/"
    end

    it "adds a shen:shell task" do
      Rake::Task::task_defined?('shen:shell').should be_true
    end

    it "gives the shen:shell task a description" do
      Rake::Task['shen:shell'].full_comment.should ==
        "Start the Shenandoah interactive JavaScript shell"
    end

    it "adds a shen:spec task" do
      Rake::Task::task_defined?('shen:spec').should be_true
    end

    it "gives the shen:spec task a description" do
      Rake::Task['shen:spec'].full_comment.should ==
        "Run the JavaScript specs"
    end

    it "adds a shen:generate task" do
      Rake::Task::task_defined?('shen:generate').should be_true
    end

    it "gives the shen:generate task a description" do
      Rake::Task['shen:generate'].full_comment.should ==
        "Generate a skeleton spec.  Give the spec name as a task arg -- i.e. shen:generate[commands]."
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

    it "only runs the specs matching the pattern argument" do
      @locator.should_receive(:spec_files).and_return(%w(ab bc cd))
      @runner.should_receive(:run_console).with(%w(bc cd)).and_return(%w(bc cd))

      @tasks.run_specs 'c'
    end

    it "throws an exception on failure" do
      @locator.should_receive(:spec_files).and_return(%w(a b c))
      @runner.should_receive(:run_console).with(%w(a b c)).and_return(%w(a b))

      lambda { @tasks.run_specs }.should raise_error(/Shenandoah specs failed!/)
    end
  end

  describe "running for real" do
    include Shenandoah::Spec::Tmpfile

    before do
      tmpscript "Rakefile", <<-RUBY
        require 'shenandoah/tasks'
        Shenandoah::Tasks.new
      RUBY
    end

    def run_specs(task='shen:spec')
      FileUtils.cd @tmpdir do
        Open3.popen3("#{Shenandoah::Spec::rake_bin} #{task}") do |stdin, stdout, stderr|
          stdin.close
          return stdout.read, stderr.read
        end
      end
    end

    def create_passing_spec(name='good')
      tmpfile "spec/#{name}_spec.js", <<-JS
        Screw.Unit(function () {
          describe("good", function () {
            it("passes", function () {
              expect("good").to(equal, "good");
            });
          });
        });
      JS
      tmpfile "spec/#{name}.html", <<-HTML
        <html>
          <head></head>
          <body></body>
        </html>
      HTML
    end

    def create_failing_spec(name='bad')
      tmpfile "spec/#{name}_spec.js", <<-JS
        Screw.Unit(function () {
          describe("bad", function () {
            it("fails", function () {
              expect("bad").to(equal, "good");
            });
          });
        });
      JS
      tmpfile "spec/#{name}.html", <<-HTML
        <html>
          <head></head>
          <body></body>
        </html>
      HTML
    end

    it "passes for a good spec" do
      create_passing_spec

      out, err = run_specs

      err.should == ""
      out.should =~ %r{1 test\(s\), 0 failure\(s\)}
    end

    it "reports all results together" do
      pending
      create_passing_spec('a')
      create_passing_spec('b')
      create_passing_spec('c')

      out, err = run_specs

      err.should == ""
      out.should =~ %r{3 test\(s\), 0 failure\(s\)}
    end

    it "fails for a bad spec" do
      create_failing_spec

      out, err = run_specs

      err.should =~ /Shenandoah specs failed/
      out.should =~ %r{1 test\(s\), 1 failure\(s\)}
    end

    it "reports all failures" do
      pending
      create_failing_spec('a')
      create_passing_spec('b')
      create_failing_spec('c')

      out, err = run_specs

      err.should =~ /Shenandoah specs failed/
      out.should =~ %r{3 test\(s\), 2 failure\(s\)}
    end

    it "only runs the specs matching the arg" do
      create_passing_spec('foo')
      create_passing_spec('bar')
      create_passing_spec('baz')

      out, err = run_specs('shen:spec[ba]')

      err.should == ""
      out.should_not =~ %r{Running foo_spec}
      out.should =~ %r{Running bar_spec}
      out.should =~ %r{Running baz_spec}
    end
  end

  describe "generation" do
    include Shenandoah::Spec::Tmpfile

    before do
      @quiet = Rake.application.options.quiet
      Rake.application.options.quiet = true
    end

    after do
      Rake.application.options.quiet = @quiet
    end

    describe "when spec path is under the working directory" do
      before do
        @specdir = tmpdir('specs')
        @tasks = Shenandoah::Tasks.new(:spec_path => @specdir)
      end

      it "fails without a name" do
        lambda { @tasks.generate_spec(nil) }.
          should raise_error(/Please specify a spec name.  E.g., shen:generate\[foo\]./)
      end

      it "generates the spec file" do
        @tasks.generate_spec('arb')
        File.exist?("#{@specdir}/arb_spec.js").should be_true
      end

      it "generates the HTML fixture" do
        @tasks.generate_spec('zamm')
        File.exist?("#{@specdir}/zamm.html").should be_true
      end

      describe "with nested paths" do
        before do
          @tasks.generate_spec("frob/zazz")
        end

        it "generates the spec file" do
          File.exist?("#{@specdir}/frob/zazz_spec.js").should be_true
        end

        it "generates the HTML fixture" do
          File.exist?("#{@specdir}/frob/zazz.html").should be_true
        end
      end
    end

    describe "when spec_path is not a child of working directory" do
      before do
        @original_wd = FileUtils.pwd
        @specdir = tmpdir('specs')
        @tasks = Shenandoah::Tasks.new(:spec_path => @specdir)
        FileUtils.cd tmpdir('other')

        @tasks.generate_spec("zip/zoom")
      end

      after do
        FileUtils.cd @original_wd
      end

      it "generates the spec file" do
        File.exist?("#{@specdir}/zip/zoom_spec.js").should be_true
      end

      it "generates the HTML fixture" do
        File.exist?("#{@specdir}/zip/zoom.html").should be_true
      end
    end
  end
end