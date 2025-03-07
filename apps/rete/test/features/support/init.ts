import { After, Before } from '@cucumber/cucumber';

import { GraphTester } from './graph';
import { TestingFileLoader } from './graph/fileLoader';
import { MBPolicyExecutor } from './graph/mbPolicyExecutor';
import { GraphWorld } from './graph/types';

// Setup the graph tester before each scenario
Before(function (this: GraphWorld) {
  const fileLoader = new TestingFileLoader();
  const policyExecutor = new MBPolicyExecutor();

  this.fileLoader = fileLoader;
  this.policyExecutor = policyExecutor;
  this.graphTester = new GraphTester(this.fileLoader, this.policyExecutor);
});

After(async function (this: GraphWorld) {
  await this.policyExecutor.destroy();
});
