import { ClassicPreset } from 'rete';
import { BehaviorSubject } from 'rxjs';

const socket = new ClassicPreset.Socket('socket');
export const TEXT_NODE = 'Text';

export class MonacoControl extends ClassicPreset.Control {
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

/**
 * This is a source node and needs to notify the engine when it updates
 *
 */
export class TextNode extends ClassicPreset.Node<
  object,
  { value: ClassicPreset.Socket },
  { value: MonacoControl }
> {
  public type = TEXT_NODE;

  constructor(
    public initial: string,
    onChange: () => void = () => {
      /**/
    }
  ) {
    super('Text');
    this.addOutput('value', new ClassicPreset.Output(socket, 'Text'));
    this.addControl('value', new MonacoControl(initial, onChange));
  }

  setLabel(label: string) {
    this.label = label;
  }

  data(): Promise<{ value: string }> {
    return Promise.resolve({ value: this.controls.value.value || '' });
  }
}
