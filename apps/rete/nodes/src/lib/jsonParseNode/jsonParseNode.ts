import { ClassicPreset } from 'rete';

const socket = new ClassicPreset.Socket('socket');
export const JSON_PARSE_NODE = 'JsonParse';

export class JsonParseNode extends ClassicPreset.Node {
  public value = '';
  public type = JSON_PARSE_NODE;
  constructor() {
    super('JsonParse');
    this.addOutput('value', new ClassicPreset.Output(socket, 'JSON'));

    const textInput = new ClassicPreset.Input(socket, 'Text');
    this.addInput('text', textInput);
  }

  data({ text }: { text?: string[] }): { value: any } {
    const value = text ? text[0] : '';

    try{
      return {
        value: JSON.parse(value),
      };
    } catch(e){
      console.error(`${this.label}: Error parsing JSON: '${value}'`, e);
      throw e;
    }
  }
}
