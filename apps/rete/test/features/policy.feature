Feature: Showing what it looks like to test a policy file using cucumber and the graph processing feature
  As a user, I want to load a policy file, parse it, and execute
  the policy to get the expected result.

  Scenario: Load policy file and execute policy
    Given I have loaded the graph file "policy.graph.json"
    When I process the graph
    Then the node "Policy Executor" should be
      """
      {
        "result": {
          "defaultOutcome": "Approved",
          "dictionaryVariables": [],
          "label": "Catalyst CC Generate Offers",
          "missingDatasourceOutcome": "Indeterminate",
          "missingFieldOutcome": "Indeterminate",
          "rexInterpreterVersion": "2"
        }
      }
      """
