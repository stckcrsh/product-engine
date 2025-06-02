import { ClassicPreset } from 'rete';
import { BehaviorSubject } from 'rxjs';

const socket = new ClassicPreset.Socket('socket');
export const MERGE_NODE = 'MergeNode';

export interface MergeNodeData {
  id: string;
  label: string;
  type: string;
  data: {
    key: string;
    value: string;
  }[];
}

export class KeyControl extends ClassicPreset.Control {
  value$: BehaviorSubject<string | undefined>;

  constructor(
    initial: string,
    private onChange: (value: string) => void = () => {
      /**/
    }
  ) {
    super();
    this.value$ = new BehaviorSubject<string | undefined>(initial);
  }

  setValue(value: string) {
    this.value$.next(value);

    this.onChange(value);
  }

  get value() {
    return this.value$.value;
  }
}

export class MergeNode extends ClassicPreset.Node {
  public type = MERGE_NODE;
  private inputCount = 0;

  constructor(
    private editorRef?: any,
    private onChange: () => void = () => {
      /**/
    },
    initialData?: MergeNodeData | null
  ) {
    super('Merge');

    // warnings
    if (!this.editorRef) {
      console.warn(
        'Editor reference is not set. Connections may not work as expected.'
      );
    }

    this.addOutput('value', new ClassicPreset.Output(socket, 'Merged Object'));

    if (initialData) {
      this.label = initialData.label;
      this.id = initialData.id;

      const inputs = initialData.data;
      inputs.forEach(({ key, value }) => {
        const index = parseInt(key.split(':')[1]);
        this.addExtraInput(index || 0);
        (this.controls[`inputKey:${index}`] as KeyControl).setValue(value);
      });
    } else {
      // Add initial input
      this.addExtraInput(1);
    }
  }

  // Add a new input with corresponding key control
  addExtraInput(index: number) {
    const inputKey = `inputKey:${index}`;
    const inputValue = `inputValue:${index}`;

    this.addControl(inputKey, new KeyControl(`key${index}`, this.onChange));
    this.inputs[inputValue] = new ClassicPreset.Input(socket, `Value ${index}`);

    this.inputCount = Math.max(this.inputCount, index);
  }

  // Remove an input and its corresponding key control
  removeExtraInput(index: number) {
    const inputKey = `inputKey:${index}`;
    const inputValue = `inputValue:${index}`;

    // Find and remove any connections to this input
    if (this.editorRef) {
      const connections = this.editorRef.getConnections();
      const connectionsToRemove = connections.filter(
        (conn: any) =>
          conn.target === this.id && conn.targetInput === inputValue
      );

      // Remove each connection
      connectionsToRemove.forEach((conn: any) => {
        this.editorRef.removeConnection(conn.id);
      });
    }

    // Remove the control and input
    delete this.controls[inputKey];
    delete this.inputs[inputValue];

    return inputValue; // Return the removed input name
  }

  // Get the next available input index
  getNextInputIndex() {
    return this.inputCount + 1;
  }

  // Add a new input/control combination
  addNewInput() {
    const nextIndex = this.getNextInputIndex();
    this.addExtraInput(nextIndex);
    return nextIndex;
  }

  async data(
    inputs: Record<string, any[]>
  ): Promise<{ value: Record<string, any> }> {
    const result: Record<string, any> = {};

    // Process each input
    Object.keys(this.inputs).forEach((inputName) => {
      if (inputName.startsWith('inputValue:')) {
        const index = inputName.split(':')[1];
        const keyControl = this.controls[`inputKey:${index}`] as KeyControl;
        const key = keyControl?.value;

        if (key && inputs[inputName] && inputs[inputName].length > 0) {
          result[key] = inputs[inputName][0];
        }
      }
    });

    return Promise.resolve({ value: result });
  }
}
