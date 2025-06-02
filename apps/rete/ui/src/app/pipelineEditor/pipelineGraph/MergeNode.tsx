import { useEffect, useState } from 'react';
import { ClassicScheme, Presets, RenderEmit } from 'rete-react-plugin';
import { Observable } from 'rxjs';
import styled, { css } from 'styled-components';

import { $nodewidth, $socketmargin, $socketsize } from './vars';

const { RefSocket, RefControl } = Presets.classic;

type NodeExtraData = { width?: number; height?: number };

export const MergeNodeStyles = styled.div<
  NodeExtraData & { selected: boolean; styles?: (props: any) => any }
>`
  background: black;
  border: 2px solid grey;
  border-radius: 10px;
  cursor: pointer;
  box-sizing: border-box;
  width: ${(props) =>
    Number.isFinite(props.width) ? `${props.width}px` : `${$nodewidth}px`};
  height: ${(props) =>
    Number.isFinite(props.height) ? `${props.height}px` : "auto"};
  padding-bottom: 6px;
  position: relative;
  user-select: none;
  &:hover {
    background: #333;
  }
  ${(props) =>
    props.selected &&
    css`
      border-color: red;
    `}
  .title {
    color: white;
    font-family: sans-serif;
    font-size: 18px;
    padding: 8px;
  }
  .output {
    text-align: right;
  }
  .input {
    text-align: left;
  }
  .output-socket {
    text-align: right;
    margin-right: -1px;
    display: inline-block;
  }
  .input-socket {
    text-align: left;
    margin-left: -1px;
    display: inline-block;
  }
  .input-title,
  .output-title {
    vertical-align: middle;
    color: white;
    display: inline-block;
    font-family: sans-serif;
    font-size: 14px;
    margin: ${$socketmargin}px;
    line-height: ${$socketsize}px;
  }
  .input-control {
    z-index: 1;
    width: calc(100% - ${$socketsize + 2 * $socketmargin}px);
    vertical-align: middle;
    display: inline-block;
  }
  .control {
    display: flex;
    align-items: center;
    padding: ${$socketmargin}px;
  }
  .key-input {
    flex: 1;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #666;
    background: #333;
    color: white;
    margin-right: 10px;
  }
  .add-input-button {
    background: #444;
    color: white;
    border: 1px solid #666;
    border-radius: 4px;
    padding: 5px 10px;
    margin: 10px auto;
    display: block;
    cursor: pointer;
    font-family: sans-serif;
    font-size: 12px;
    &:hover {
      background: #555;
    }
  }
  .input-row {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .remove-input-button {
    background: #700;
    color: white;
    border: none;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 5px;
    &:hover {
      background: #900;
    }
  }
  ${(props) => props.styles && props.styles(props)}
`;

type Props<S extends ClassicScheme> = {
  data: S["Node"] & NodeExtraData;
  styles?: () => any;
  emit: RenderEmit<S>;
};

const KeyControl = ({ value$, onChange }: { value$: Observable<any>, onChange: (value: any) => void }) => {
  const [keyValue, setKeyValue] = useState('');

  useEffect(() => {
    const subscription = value$.subscribe((value) => {
      setKeyValue(value);
    }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [value$]);

  return (
    <input
      className="key-input"
      type="text"
      value={keyValue || ''}
      placeholder="Key name"
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    />
  )
}

export const createMergeNode = (area: any) => function MergeNode<Scheme extends ClassicScheme>(props: Props<Scheme>) {
  const { data, emit } = props;
  const { id, label, width, height } = data;
  const selected = data.selected || false;

  const [title, setTitle] = useState(label);

  // Get all inputs that start with 'inputValue:'
  const inputEntries = Object.entries(data.inputs)
    .filter(([key, value]) => key.startsWith('inputValue:') && !!value)
    .sort(([keyA], [keyB]) => {
      const indexA = parseInt(keyA.split(':')[1]);
      const indexB = parseInt(keyB.split(':')[1]);
      return indexA - indexB;
    });

  // Get all key controls that start with 'inputKey:'
  const keyControls = Object.entries(data.controls)
    .filter(([key]) => key.startsWith('inputKey:'))
    .sort(([keyA], [keyB]) => {
      const indexA = parseInt(keyA.split(':')[1]);
      const indexB = parseInt(keyB.split(':')[1]);
      return indexA - indexB;
    });

  // Get the output
  const output = Object.entries(data.outputs)[0];

  const storeTitle = () => {
    data.label = title;
  };

  const handleAddInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Call the addNewInput method on the node instance
    const node = data as any;
    if (node.addNewInput) {
      node.addNewInput();
      // Trigger a re-render of the node
      area.update("node", id)
    }
  };

  const handleRemoveInput = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = data as any;
    if (node.removeExtraInput) {
      node.removeExtraInput(index);
      // Trigger a re-render
      area.update("node", id);
    }
  };

  return (
    <MergeNodeStyles
      selected={selected}
      width={width}
      height={height}
      styles={props.styles}
      data-testid="merge-node"
    >
      <div className="title" data-testid="title">
        <input
          onPointerDown={(e) => e.stopPropagation()}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={storeTitle}
        />
      </div>

      {/* Output */}
      {output && output[1] && (
        <div className="output" key={output[0]} data-testid={`output-${output[0]}`}>
          <div className="output-title" data-testid="output-title">
            {output[1].label}
          </div>
          <RefSocket
            name="output-socket"
            side="output"
            emit={emit}
            socketKey={output[0]}
            nodeId={id}
            payload={output[1].socket}
          />
        </div>
      )}

      {/* Input Rows - each with a key input and socket */}
      {inputEntries.map(([inputKey, input], index) => {
        const keyControlEntry = keyControls.find(([key]) => {
          const inputIndex = inputKey.split(':')[1];
          const keyIndex = key.split(':')[1];
          return inputIndex === keyIndex;
        });

        const keyControl = keyControlEntry ? keyControlEntry[1] : null;
        const inputIndex = parseInt(inputKey.split(':')[1]);

        return (
          <div className="input-row" key={inputKey}>
            {input &&
              <RefSocket
                name="input-socket"
                emit={emit}
                side="input"
                socketKey={inputKey}
                nodeId={id}
                payload={input.socket}
              />
            }

            <KeyControl
              value$={(keyControl as any)?.value$}
              onChange={(value) => {
                if (keyControl) {
                  (keyControl as any).setValue(value);
                  area.update("control", keyControl.id)
                }
              }}
            />

            <button
              className="remove-input-button"
              onClick={(e) => handleRemoveInput(inputIndex, e)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Add Input Button */}
      <button
        className="add-input-button"
        onClick={handleAddInput}
        onPointerDown={(e) => e.stopPropagation()}
      >
        + Add Input
      </button>
    </MergeNodeStyles>
  );
}
