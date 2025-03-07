import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import styled from 'styled-components';

import { OutputFormat } from '../../listener.service';
import { Connector, DefineNodeShapes, NodeShape, NodeTypes } from './NodeShape';

const Box = styled.div`
  display: flex;
`;

interface PolicyNodeType {
  id: string;
  type: string;
  parentId: string;
  childrenOrder: string[];
  data: {
    label: string;
    task: string;
    policyName: string;
    isCollapsed: boolean;
  };
  selected: boolean;
  position: {
    x: number;
    y: number;
  };
}

const W = 200 + 100;
const H = 44 + 8;

const NodeTypesExtraHeight = (type: string | undefined): number => {
  switch (type as NodeTypes) {
    case NodeTypes.Datasource:
    case NodeTypes.ScoreCard:
    case NodeTypes.OfferCard:
      return 24;
    default:
      return 0;
  }
};

const layoutGraph = (
  rootId: string,
  policyMap: Map<string, PolicyNodeType>,
  yOffset: number,
  selected: string,
): { yOffset: number } => {
  const traverseGraph = (
    nodeId: string,
    level: number,
    yOffset: number,
    selected: string,
  ): { yOffset: number; extraH: number } => {
    const policyNode = policyMap.get(nodeId);

    if (!policyNode) {
      console.warn("Can't find node:", nodeId);
      return { yOffset, extraH: 0 };
    }

    const children = [...(policyNode?.childrenOrder || [])].reverse();
    const bigNodeOffsetY = NodeTypesExtraHeight(policyNode.type);

    // yOffset and extraH will be re-assigned by the last child
    let extraH = 0;
    yOffset += bigNodeOffsetY;
    if (!policyNode.data?.isCollapsed) {
      children.forEach(
        (childNodeId: string) =>
        ({ yOffset, extraH } = traverseGraph(
          childNodeId,
          level + 1,
          yOffset,
          selected,
        )),
      );
    } else {
      yOffset += H;
    }
    yOffset += bigNodeOffsetY - (children.length ? H : 0) - extraH;

    // [edges, selected-edges, nodes[0]...nodes[n]] = [0, 1, 2...2 + n]
    policyNode.position = { x: level * W, y: -yOffset };
    policyNode.selected = policyNode.id === selected;

    yOffset += H + extraH;
    return { yOffset, extraH: extraH + bigNodeOffsetY };
  };

  const result = {
    yOffset: traverseGraph(rootId, 0, yOffset || 0, selected).yOffset,
  };
  policyMap.forEach((policyNode) => {
    if (policyNode.position) policyNode.position.y += result.yOffset;
  });

  return result;
};

// const RenderedGraph = (children: any, onNodeClick: Function): JSX.Element => {
export const RenderedGraph = ({
  children,
  onNodeClick,
}: {
  children: any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onNodeClick: Function;
}): JSX.Element => {
  const [selected, setSelected] = useState('');
  const [showContext, setShowContext] = useState(false);

  const rawContent = children.content; // an array of policyNodes
  // create policyMap using id as key
  const policyMap = new Map<string, PolicyNodeType>(
    rawContent.map((policyNode: PolicyNodeType) => [policyNode.id, policyNode]),
  );

  // set the policyNode with type == "policy" as root node
  const rootId = Array.from(policyMap.keys()).find(
    (key) => policyMap.get(key)?.type === 'policy',
  );
  layoutGraph(rootId!, policyMap, 0, selected);

  useEffect(() => {
    layoutGraph(rootId!, policyMap, 0, selected);
  }, [selected]);

  if (!children?.content) {
    return <Box />;
  }

  // render policyMap
  // compose an svg graph using policyNode postions, labels, and types
  return (
    <Box>
      {Array.from(policyMap.values()).map((policyNode, i) => (
        <>
          <Box
            key={policyNode.id}
            style={{
              position: 'absolute',
              left: policyNode.position?.x || 0,
              top: policyNode.position?.y || i * 50,
            }}
            onClick={() => {
              setSelected(policyNode.id);
              setShowContext(false);
              onNodeClick(policyNode);
            }}
            onContextMenu={(e) => {
              // alert('context menu coming soon');
              setSelected(policyNode.id);
              setShowContext(true);
              onNodeClick(policyNode);
              e.preventDefault();
            }}
          >
            <NodeShape
              type={policyNode.type}
              highlighted={false}
              selected={policyNode.selected}
              empty={false}
              error={false}
            />
            <Box
              style={{
                position: 'absolute',
                backgroundColor: 'white',
                left: 30,
                top: 20,
                fontSize: 14,
                pointerEvents: 'none',
              }}
            >
              {policyNode.data?.label ||
                policyNode.data?.task ||
                policyNode.data?.policyName}
            </Box>
          </Box>

          <Connector
            p1={policyMap.get(policyNode.parentId)?.position}
            p2={policyNode.position}
          />
        </>
      ))}
    </Box>
  );
};

const OverflowWrapper = styled.div`
  overflow: auto;
  position: relative;
  height: 100%;
`;

export const PolicyGraphPanel = ({ output$, output }: { output$: Observable<OutputFormat>; output: string }) => {
  const [data, setData] = useState<any | null | undefined>();

  useEffect(() => {
    const sub = output$.subscribe((value: any) => {
      if (value.status === 'success') {
        setData(value.data[output]);
      }
      if (value.status === 'error') {
        setData((value.data as any).message);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [output$, output]);

  if (!data) {
    return null
  }

  return (
    <OverflowWrapper>
      <DefineNodeShapes />
      <RenderedGraph
        children={data}
        onNodeClick={(node: PolicyNodeType) => {
          console.log('nodeId', node?.id, node);
        }}
      />
    </OverflowWrapper>
  )
}
