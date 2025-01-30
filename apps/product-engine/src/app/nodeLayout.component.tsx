import styled from 'styled-components';

import { NodeResizeControl } from '@xyflow/react';

function ResizeIcon() {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="#ff0071"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ position: 'absolute', right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

const NodeWrapper = styled.div`
  border:1px solid #000;
  padding: 4px;
`

const controlStyle = {
  background: 'transparent',
  border: 'none',
};

type NodeLayoutProps = {
  slots: {
    inputs: any,
    outputs: any,
    preview: any,
    heading: any
  }
}

/**
 *
 * @param param0
 * @returns
 */
export const NodeLayout = ({ slots: { inputs, outputs, preview, heading } }: NodeLayoutProps) => {
  return (
    <NodeWrapper style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: '0 1 auto' }}>
        {heading}
      </div>
      <div style={{ display: 'flex', flex: '1 1 auto' }}>
        <div style={{ flex: '1 1 auto' }}>
          {inputs}
        </div>
        <div style={{ flex: '2 1 auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: '1 1 auto' }}>
            {outputs}
          </div>
          <div style={{ flex: '1 1 auto' }}>
            {preview}
          </div>
        </div>
      </div>
      <div style={{  display: 'flex', flex: '0 1 auto', minHeight: 10 }}>
        <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
          <ResizeIcon />
        </NodeResizeControl>
      </div>
    </NodeWrapper>
  )
}
