Feature: Testing buildr projects

  Scenario: Defined tasks
    Given a buildr project
    When I list the available buildr tasks
    Then the task list should include life:shen:serve
      And the task list should include life:shen:generate
      And the task list should include life:shen:shell

  Scenario: Running the server
    Given a buildr project
    When I execute `buildr life:shen:serve`
    Then the server should be running

  Scenario: Running all specs
    Given a buildr project
    When I execute `buildr test`
    Then 49 specs should run

  Scenario: Running one spec
    Given a buildr project
    When I execute `buildr test:life_spec`
    Then 1 spec should run

  Scenario: Generating a spec
    Given a buildr project
    When I execute `buildr life:shen:generate[pre_view]`
    Then the file "src/spec/javascript/pre_view_spec.js" should exist
      And the file "src/spec/javascript/pre_view.html" should exist
