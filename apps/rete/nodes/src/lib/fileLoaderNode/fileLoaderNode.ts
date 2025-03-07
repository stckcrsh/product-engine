import { ClassicPreset } from 'rete';
import { BehaviorSubject, firstValueFrom, Observable, skip, Subscription } from 'rxjs';

const socket = new ClassicPreset.Socket('socket');
export const FILE_LOADER_NODE = 'FileLoader';

export interface FileLoader {
  loadFile: (file: string) => Promise<Observable<string | null>>;
}

/**
 *
 */
export class FileControl extends ClassicPreset.Control {
  value$: BehaviorSubject<string>;

  constructor(
    initial = '',
    private onChange: (value: string) => void = () => {
      /**/
    }
  ) {
    super();
    this.value$ = new BehaviorSubject<string>(initial);
    this.value$.subscribe(value => this.onChange(value));
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
 * This is a source node that a user enters in a file path and the engine loads the file
 * the file loader then watches for file updates and forces the onchange event
 */
export class FileLoaderNode extends ClassicPreset.Node<
  object,
  { file: ClassicPreset.Socket },
  { file: FileControl }
> {
  private filePath$: BehaviorSubject<string>;
  private unsub?: Subscription;

  public value?: Promise<string | null>;
  public type = FILE_LOADER_NODE;

  constructor(
    public initial: string,
    public fileLoader: FileLoader,
    private onChange: () => void = () => {
      /**/
    }
  ) {
    super('File');
    this.filePath$ = new BehaviorSubject<string>(initial);

    this.addOutput('file', new ClassicPreset.Output(socket, 'File'));
    this.addControl(
      'file',
      new FileControl(initial, this.filePath$.next.bind(this.filePath$))
    );

    this.filePath$.pipe(
    ).subscribe((filepath) => this.onFilepathUpdate(filepath));
  }

  async onFilepathUpdate(filePath: string) {
    if (this.unsub) {
      this.unsub.unsubscribe();
    }

    if (!filePath) {
      this.value = Promise.resolve(null);
      return;
    }

    const stream$ = await this.fileLoader.loadFile(filePath);
    this.value = firstValueFrom(stream$);

    this.unsub = stream$.pipe(skip(1)).subscribe((data) => {
      this.value = Promise.resolve(data);
      this.onChange();
    });
  }

  async data(): Promise<{ file: string }> {
    const value = await this.value;
    if (value) {
      return { file: value };
    }
    throw new Error('File not loaded or removed');
  }
}
