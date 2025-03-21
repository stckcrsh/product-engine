import Ajv from 'ajv';
import { ClassicPreset } from 'rete';

import { processInput } from '../utils';

const ajv = new Ajv();

const socket = new ClassicPreset.Socket('socket');
export const JSON_SCHEMA_NODE = 'JsonSchema';

export class JsonSchemaNode extends ClassicPreset.Node {
  public value = '';
  public type = JSON_SCHEMA_NODE;
  constructor() {
    super(JSON_SCHEMA_NODE);
    this.addOutput('result', new ClassicPreset.Output(socket, 'Result'));

    const objInput = new ClassicPreset.Input(socket, 'Target');
    this.addInput('target', objInput);

    const schemaInput = new ClassicPreset.Input(socket, 'Schema');
    this.addInput('schema', schemaInput);
  }

  data({
    target,
    schema,
  }: {
    target?: any[];
    schema?: Record<string, unknown>[];
  }): { result: any } {
    const targetInput = processInput(target);
    const schemaInput = processInput(schema);

    if (!targetInput || !schemaInput) {
      console.error(`${this.label}: Missing required inputs: object, schema`);
      throw new Error('Missing required inputs: object, schema');
    }

    const validate = ajv.compile(schemaInput);

    try {
      const valid = validate(targetInput);
      if (!valid) {
        throw new Error(`Invalid target: ${ajv.errorsText(validate.errors)}`);
      }
      return {
        result: targetInput
      };
    } catch (e) {
      console.error(`${this.label}: Error processing json schema`, e);
      throw e;
    }
  }
}
