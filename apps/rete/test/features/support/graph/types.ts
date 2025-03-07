import { World } from '@cucumber/cucumber';
import { FileLoader, PolicyExecutor } from '@product-engine/rete-pe-nodes';

import { GraphTester } from './graphTester';

export interface GraphWorld extends World {
  graphTester: GraphTester;
  fileLoader: FileLoader;
  policyExecutor: PolicyExecutor;
}
