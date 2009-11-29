Feature: Testing rails projects

  Scenario: Defined tasks
    Given a rails project
    When I list the available rake tasks
    Then the task list should include shen:serve
      And the task list should not include shen:generate[basename]
      And the task list should include shen:spec[pattern]
      And the task list should include shen:shell

  Scenario: Running the server
    Given a rails project
    When I execute `rake shen:serve`
    Then the server should be running

  Scenario: Running all specs
    Given a rails project
    When I execute `rake shen:spec`
    Then 49 specs should run

  Scenario: Running one spec
    Given a rails project
    When I execute `rake shen:spec[life_spec]`
    Then 1 spec should run

  Scenario: Integrating with a new rails project
    Given an empty rails project
    When I execute `script/generate shenandoah`
    Then the file "lib/tasks/shenandoah.rake" should exist
      And the directory "test/javascript" should exist
      And the file "test/javascript/spec_helper.js" should exist
      And the file "test/javascript/application.html" should exist
      And the file "test/javascript/application_spec.js" should exist

  Scenario: Generating a spec
    Given a rails project
    When I execute `script/generate shen_spec pre_view`
    Then the file "test/javascript/pre_view_spec.js" should exist
      And the file "test/javascript/pre_view.html" should exist
