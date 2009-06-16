require File.expand_path("../spec_helper", File.dirname(__FILE__))

require 'rails_generator'
require 'rails_generator/lookup'

module Shenandoah::Spec
  module UseGenerators
    def self.included(klass)
      klass.class_eval do
        before do
          Rails::Generator::Base.sources.unshift(
            Rails::Generator::PathSource.new("local", File.dirname(__FILE__) + "/../../rails_generators"))
        end

        after do
          Rails::Generator::Base.sources.shift
        end
      end
    end
  end
end