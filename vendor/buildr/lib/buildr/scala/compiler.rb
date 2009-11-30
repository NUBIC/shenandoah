# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with this
# work for additional information regarding copyright ownership.  The ASF
# licenses this file to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
# License for the specific language governing permissions and limitations under
# the License.

require 'buildr/core/project'
require 'buildr/core/common'
require 'buildr/core/compile'
require 'buildr/packaging'

module Buildr::Scala
  DEFAULT_VERSION = '2.7.7'   # currently the latest (Oct 31, 2009)
  
  class << self
    
    # Retrieves the Scala version string from the 
    # standard library or nil if Scala is not
    # available.
    def version_str
      begin
        # Scala version string normally looks like "version 2.7.3.final"
        Java.scala.util.Properties.versionString.sub 'version ', ''
      rescue
        nil
      end
    end
    
    def version
      if version_str
        # any consecutive sequence of numbers followed by dots
        match = version_str.match(/\d+\.\d[\d\.]*/) or
          fail "Unable to parse Scala version: #{version_str} "
        match[0].sub(/.$/, "") # remove trailing dot, if any
      else
        DEFAULT_VERSION       # TODO return the version installed from Maven repo
      end
    end
  end

  # Scalac compiler:
  #   compile.using(:scalac)
  # Used by default if .scala files are found in the src/main/scala directory (or src/test/scala)
  # and sets the target directory to target/classes (or target/test/classes).
  #
  # Accepts the following options:
  # * :warnings    -- Generate warnings if true (opposite of -nowarn).
  # * :deprecation -- Output source locations where deprecated APIs are used.
  # * :optimise    -- Generates faster bytecode by applying optimisations to the program.
  # * :target      -- Class file compatibility with specified release.
  # * :debug       -- Generate debugging info.
  # * :other       -- Array of options to pass to the Scalac compiler as is, e.g. -Xprint-types
  class Scalac < Buildr::Compiler::Base
    
    # The scalac compiler jars are added to classpath at load time,
    # if you want to customize artifact versions, you must set them on the
    #
    #      artifact_ns['Buildr::Compiler::Scalac'].library = '2.7.5'
    #
    # namespace before this file is required.  This is of course, only
    # if SCALA_HOME is not set or invalid.
    REQUIRES = ArtifactNamespace.for(self) do |ns|
      ns.library!      'org.scala-lang:scala-library:jar:>=' + DEFAULT_VERSION
      ns.compiler!     'org.scala-lang:scala-compiler:jar:>=' + DEFAULT_VERSION
    end
    
    class << self
      def scala_home
        env_home = ENV['SCALA_HOME']
        
        @home ||= (if !env_home.nil? && File.exists?(env_home + '/lib/scala-library.jar') && File.exists?(env_home + '/lib/scala-compiler.jar')
          env_home
        else
          nil
        end)
      end
      
      def installed?
        !scala_home.nil?
      end

      def dependencies
        if installed?
          ['scala-library', 'scala-compiler'].map { |s| File.expand_path("lib/#{s}.jar", scala_home) }
        else
          REQUIRES.artifacts.map(&:to_s)
        end
      end

      def use_fsc
        installed? && ENV["USE_FSC"] =~ /^(yes|on|true)$/i
      end
      
      def applies_to?(project, task) #:nodoc:
        paths = task.sources + [sources].flatten.map { |src| Array(project.path_to(:source, task.usage, src.to_sym)) }
        paths.flatten!
        
        # Just select if we find .scala files
        paths.any? { |path| !Dir["#{path}/**/*.scala"].empty? }
      end
    end
    
    Javac = Buildr::Compiler::Javac

    OPTIONS = [:warnings, :deprecation, :optimise, :target, :debug, :other, :javac]
    
    Java.classpath << dependencies

    specify :language=>:scala, :sources => [:scala, :java], :source_ext => [:scala, :java],
            :target=>'classes', :target_ext=>'class', :packaging=>:jar

    def initialize(project, options) #:nodoc:
      super
      options[:debug] = Buildr.options.debug if options[:debug].nil?
      options[:warnings] = verbose if options[:warnings].nil?
      options[:deprecation] ||= false
      options[:optimise] ||= false
      options[:javac] ||= {}
      
      @java = Javac.new(project, options[:javac])
    end

    def compile(sources, target, dependencies) #:nodoc:
      check_options options, OPTIONS

      cmd_args = []
      cmd_args << '-classpath' << (dependencies + Scalac.dependencies).join(File::PATH_SEPARATOR)
      source_paths = sources.select { |source| File.directory?(source) }
      cmd_args << '-sourcepath' << source_paths.join(File::PATH_SEPARATOR) unless source_paths.empty?
      cmd_args << '-d' << File.expand_path(target)
      cmd_args += scalac_args
      cmd_args += files_from_sources(sources)

      unless Buildr.application.options.dryrun
        trace((['scalac'] + cmd_args).join(' '))
        
        if Scalac.use_fsc
          system(([File.expand_path('bin/fsc', Scalac.scala_home)] + cmd_args).join(' ')) or
            fail 'Failed to compile, see errors above'
        else
          Java.load
          begin
            Java.scala.tools.nsc.Main.process(cmd_args.to_java(Java.java.lang.String))
          rescue => e
            fail "Scala compiler crashed:\n#{e.inspect}" 
          end
          fail 'Failed to compile, see errors above' if Java.scala.tools.nsc.Main.reporter.hasErrors
        end
 
        java_sources = java_sources(sources)
        unless java_sources.empty?
          trace 'Compiling mixed Java/Scala sources'
          
          # TODO  includes scala-compiler.jar
          deps = dependencies + Scalac.dependencies + [ File.expand_path(target) ]
          @java.compile(java_sources, target, deps)
        end
      end
    end

  private

    def java_sources(sources)
      sources.flatten.map { |source| File.directory?(source) ? FileList["#{source}/**/*.java"] : source } .
        flatten.reject { |file| File.directory?(file) || File.extname(file) != '.java' }.map { |file| File.expand_path(file) }.uniq
    end

    # Returns Scalac command line arguments from the set of options.
    def scalac_args #:nodoc:
      args = []
      args << "-nowarn" unless options[:warnings]
      args << "-verbose" if Buildr.application.options.trace
      args << "-g" if options[:debug]
      args << "-deprecation" if options[:deprecation]
      args << "-optimise" if options[:optimise]
      args << "-target:jvm-" + options[:target].to_s if options[:target]
      args + Array(options[:other])
    end

  end
    
end

# Scala compiler comes first, ahead of Javac, this allows it to pick
# projects that mix Scala and Java code by spotting Scala code first.
Buildr::Compiler.compilers.unshift Buildr::Scala::Scalac
