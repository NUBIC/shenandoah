require File.expand_path('spec_helper', File.dirname(__FILE__))

require 'rails_generator/scripts/generate'

describe "shenandoah generator" do
  include Shenandoah::Spec::RailsRoot
  include Shenandoah::Spec::UseGenerators

  def generate
    Rails::Generator::Scripts::Generate.new.run(["shenandoah", "-q"])
  end

  describe "generation" do
    describe "of lib/tasks/shenandoh.rake" do
      before do
        generate
        @path = "#{RAILS_ROOT}/lib/tasks/shenandoah.rake"
      end

      it "happens" do
        File.exist?(@path).should be_true
      end

      it "has the right content" do
        content = File.read(@path)
        content.should =~ %r{require 'shenandoah/rails/tasks'}
        content.should =~ %r{Shenandoah::Rails::Tasks.new}
      end
    end

    %w(spec examples test).each do |dir|
      describe "when the project uses '#{dir}'" do
        before do
          FileUtils.mkdir_p "#{RAILS_ROOT}/#{dir}"
          generate
        end

        it "generates spec_helper" do
          File.exist?("#{RAILS_ROOT}/#{dir}/javascript/spec_helper.js").should be_true
        end

        describe "creation of application_spec.js" do
          before do
            @path = "#{RAILS_ROOT}/#{dir}/javascript/application_spec.js"
          end

          it "happens" do
            File.exist?(@path).should be_true
          end

          it "requires spec_helper" do
            File.read(@path).should =~ %r{require_spec\('spec_helper.js'\)}
          end

          it "requires application.js" do
            File.read(@path).should =~ %r{require_main\('application.js'\)}
          end
        end

        describe "creation of application.html" do
          before do
            @path = "#{RAILS_ROOT}/#{dir}/javascript/application.html"
          end

          it "happens" do
            File.exist?(@path).should be_true
          end

          it "links to shenandoah's runner" do
            File.read(@path).should =~ %r{src="/shenandoah/browser-runner.js"}
          end

          it "links to the served screw.css" do
            File.read(@path).should =~ %r{href="/screw.css"}
          end
        end
      end
    end
  end
end