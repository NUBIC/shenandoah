require File.expand_path('spec_helper', File.dirname(__FILE__))

require 'rails_generator/scripts/generate'

describe "shen_spec generator" do
  include Shenandoah::Spec::RailsRoot
  include Shenandoah::Spec::UseGenerators

  def generate(name='common')
    Rails::Generator::Scripts::Generate.new.run(["shen_spec", name, "-q"])
  end

  describe "generation" do
    %w(spec test examples).each do |dir|
      describe "when the rails project has a #{dir}" do
        before do
          FileUtils.mkdir "#{RAILS_ROOT}/#{dir}"
          generate
        end

        it "puts the HTML fixture in the right place" do
          File.exist?("#{RAILS_ROOT}/#{dir}/javascript/common.html").should be_true
        end

        it "puts the JavaScript spec in the right place" do
          File.exist?("#{RAILS_ROOT}/#{dir}/javascript/common_spec.js").should be_true
        end
      end
    end

    {
      'common' => ['common', 'Common'],
      'some_spec' => ['some', 'Some'],
      'models/hat' => ['models/hat', 'models.Hat'],
      'models/helicopter_spec' => ['models/helicopter', 'models.Helicopter'],
      'themes/light/alison' => ['themes/light/alison', 'themes.light.Alison']
    }.each do |input, (expected_filename, expected_classname)|
      describe "for '#{input}'" do
        describe "the HTML" do
          before do
            generate(input)
            @html = File.read("#{RAILS_ROOT}/test/javascript/#{expected_filename}.html")
          end

          it "includes the name in the title" do
            @html.should =~ %r{<title>#{expected_filename}.js | JavaScript Testing Results</title>}
          end

          it "includes the runner script" do
            @html.should =~ %r{src="/shenandoah/browser-runner.js"}
          end

          it "includes screw.css" do
            @html.should =~ %r{href="/screw.css"}
          end
        end

        describe "the JS" do
          before do
            @input = input
            @filename = expected_filename
          end
          
          def js
            @js ||= begin
              generate(@input)
              File.read("#{RAILS_ROOT}/test/javascript/#{@filename}_spec.js")
            end
          end

          it "builds a Screw.Unit spec" do
            js.should =~ %r{Screw.Unit}
          end

          it "requires the spec_helper if it exists" do
            FileUtils.mkdir_p "#{RAILS_ROOT}/test/javascript"
            File.open("#{RAILS_ROOT}/test/javascript/spec_helper.js", 'w') { }
            js.should =~ %r{require_spec\('spec_helper.js'\);\n}
          end

          it "does not require the spec_helper if it does not" do
            js.should_not =~ %r{require_spec\('spec_helper.js'\);}
            js.should =~ %r{^require_main} # ensure no blank line
          end

          it "requires the presumed main file" do
            js.should =~ %r{require_main\('#{expected_filename}.js'\);}
          end

          it "describes the main file" do
            js.should =~ %r{describe\('#{expected_classname}', function \(\) \{}
          end
        end
      end
    end
  end
end