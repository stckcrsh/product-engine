Feature: Graph processing
  As a user, I want to load a graph file, set up nodes, and process the graph to get the expected result.

  Scenario: Load graph file and process nodes
    Given I have loaded the graph file "graphFile.graph"
    And I set the "Variables" control "value" to '{"name":"another name"}'
    When I process the graph
    Then the node "result" should be '{"value":{"fun":"another name"}}'


  Scenario: Load graph file and process nodes again
    Given I have loaded the graph file "graphFile.graph"
    And I set the "Variables" control "value" to '{"name":"some name"}'
    And I set the "Template Text" control "value" to '{"${name}":"timessdfd"}'
    When I process the graph
    Then the node "result" should be '{"value":{"some name":"timessdfd"}}'

  Scenario: Test $map feature with array
    Given I have loaded the graph file "graphFile.graph"
    And I set the "Variables" control "value" to '{"items":[1,2,3,4]}'
    And I set the "Template Text" control "value" to
      """
      {
        "$map": {"$eval":"items"},
        "each(x)": {
          "item": {
            "$eval":"x"
          }
        }
      }
      """
    When I process the graph
    Then the node "result" should be
      """
      {
        "value": [
          {"item":1},
          {"item":2},
          {"item":3},
          {"item":4}
        ]
      }
      """

  Scenario: Test $if conditional logic
    Given I have loaded the graph file "graphFile.graph"
    And I set the "Variables" control "value" to '{"showGreeting":true,"name":"John"}'
    And I set the "Template Text" control "value" to
      """
      {
        "$if": "showGreeting",
        "then": {"greeting": "Hello ${name}"},
        "else": {"greeting": "Anonymous user"}
      }
      """
    When I process the graph
    Then the node "result" should be '{"value":{"greeting":"Hello John"}}'

  Scenario: Test $if conditional logic 2
    Given I have loaded the graph file "graphFile.graph"
    And I set the "Variables" control "value" to '{"showGreeting":true,"name":"John"}'
    And I set the "Template Text" control "value" to
      """
      {
        "$if": "showGreeting",
        "then": {"greeting": "Hello ${name}"},
        "else": {"greeting": "Anonymous user"}
      }
      """
    When I process the graph
    Then the node "result" should be '{"value":{"greeting":"Hello John"}}'
