import '../support/init';

import assert from 'assert';

import { Given, Then, When } from '@cucumber/cucumber';

import { GraphWorld } from '../support/graph/types';

Given(
  'I have loaded the graph file {string}',
  async function (this: GraphWorld, filename: string) {
    await this.graphTester.loadGraph(filename);
  }
);

// Sets the value of a control on a node
Given(
  'I set the {string} control {string} to {string}',
  function (
    this: GraphWorld,
    label: string,
    controlName: string,
    value: string
  ) {
    this.graphTester.setNodeControlValue(label, controlName, value);
  }
);

// Multiline version for setting the value of a control on a node
Given(
  'I set the {string} control {string} to',
  function (
    this: GraphWorld,
    label: string,
    controlName: string,
    value: string
  ) {
    this.graphTester.setNodeControlValue(label, controlName, value);
  }
);

When('I process the graph', async function (this: GraphWorld) {
  await this.graphTester.processGraph();
});
async function assertNode(this: GraphWorld, label: string, expected: string) {
  const actual = await this.graphTester.fetchGraphNode(label);
  let expectedJson;
  try {
    expectedJson = JSON.parse(expected);
  } catch (e) {
    throw new Error('Expected value is not a valid JSON string');
  }
  assert.deepStrictEqual(actual, expectedJson);
}
Then('the node {string} should be {string}', assertNode);
Then('the node {string} should be', assertNode);
