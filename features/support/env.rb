require 'spec/expectations'

Before do
  @original_wd = FileUtils.pwd
end

After do
  FileUtils.cd @original_wd
  if @pipe
    Process.kill 15, @pipe.pid
    @pipe.close
  end
  cleanup
end

class ShenandoahWorld
  include FileUtils

  def root_path
    @root ||= File.expand_path("../../..")
  end

  def base_project
    @base_project ||= File.expand_path("../example_projects/base", File.dirname(__FILE__))
  end

  def piped_execute(command)
    @pipe = IO.popen(command)
  end

  def executable(name)
    case name
    when 'buildr':
      buildr_exec
    when 'rake':
      rake_exec
    else
      name
    end
  end

  def rake_exec
    "#{root_path}/gem_bin/rake"
  end

  def buildr_exec
    "#{root_path}/vendor/buildr/_buildr"
  end

  def switch_to_project(name)
    path = File.expand_path("../#{name}", base_project);
    self.temp_projects << path
    mkdir_p path
    cd path
    path
  end

  def cleanup
    self.temp_projects.each { |dir| rm_rf dir }
  end

  protected

  def temp_projects
    @temp_projects ||= []
  end
end

World do
  ShenandoahWorld.new
end
