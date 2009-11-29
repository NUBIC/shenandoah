Feature:  Testing projects which just use rake

  Scenario: Defined tasks
    Given a plain-rake project
    When I list the available rake tasks
    Then the task list should include shen:serve
      And the task list should include shen:generate[basename]
      And the task list should include shen:spec[pattern]
      And the task list should include shen:shell

  Scenario: Running the server
    Given a plain-rake project
    When I execute `rake shen:serve`
    Then the server should be running

  Scenario: Running all specs
    Given a plain-rake project
    When I execute `rake shen:spec`
    Then 49 specs should run

  Scenario: Running one spec
    Given a plain-rake project
    When I execute `rake shen:spec[life_spec]`
    Then 1 spec should run

  Scenario: Generating a spec
    Given an empty plain-rake project
    When I execute `rake shen:generate[pre_view]`
    Then the file "spec/pre_view_spec.js" should exist
      And the file "spec/pre_view.html" should exist
