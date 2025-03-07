import { ClassicPreset } from 'rete';

import { MonacoControl } from '../textNode';

const socket = new ClassicPreset.Socket('socket');
export const MERGE_NODE = 'MergeNode';

export class MergeNode extends ClassicPreset.Node<
  Record<string, ClassicPreset.Socket>,
  { value: ClassicPreset.Socket },
  Record<string, MonacoControl>
> {
  public type = MERGE_NODE;

  constructor(
    private onChange: () => void = () => {
      /* */
    }
  ) {
    super('Merge');
    this.addOutput('value', new ClassicPreset.Output(socket, 'JSON'));

    this.newInput();
  }

  private getLabelText(num: number) {
    return `Text:${num}`;
  }

  public newInput() {
    const label = this.getLabelText(Object.keys(this.controls).length);

    this.addInput(label, new ClassicPreset.Input(socket, 'Text'));
    this.addControl(label, new MonacoControl('', this.onChange));
  }

  /**
   * The idea here is that
   * @param param0
   * @returns
   */
  data(input: Record<string, string[] | undefined>): { value: any } {
    const entries = Object.entries(input);

    // for each entry i need to make sure that there is a matching control
    // if not then throw an error because the control is missing data
    entries.forEach(([key]) => {
      if (!this.controls[key]) {
        throw new Error(`Control missing for input: '${key}'`);
      }
    });

    // now combine all the values into a single object and use the control as the key
    const value = entries.reduce((acc, [key, text]) => {
      const control = this.controls[key].value!
      acc[control] = text ? text[0] : '';
      return acc;
    }, {} as Record<string, string>);

    try {
      return {
        value,
      };
    } catch (e) {
      console.error(`Error parsing JSON: '${value}'`, e);
      throw e;
    }
  }
}
