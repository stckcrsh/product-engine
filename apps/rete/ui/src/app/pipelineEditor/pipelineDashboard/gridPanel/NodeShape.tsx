import styled from 'styled-components';

const UNIT_SIZE = 10;
const baseunit = (x: number): number => x * UNIT_SIZE;

export enum NodeTypes {
  Policy = 'policy',
  RuleSet = 'ruleset',
  Rule = 'rule',
  Condition = 'condition',
  Task = 'task',
  SubTask = 'subtask',
  Variable = 'variable',
  Datasource = 'datasource',
  SystemEvent = 'system_event',
  ScoreCard = 'scorecard',
  OfferCard = 'offers',
  Router = 'router',
  SubPolicy = 'subpolicy',
}

const NodeShapes: Record<string, NodeTypes | string> = {
  default: 'default',
  [NodeTypes.OfferCard]: NodeTypes.OfferCard,
  [NodeTypes.Condition]: NodeTypes.Condition,
  [NodeTypes.ScoreCard]: NodeTypes.ScoreCard,
  [NodeTypes.Datasource]: NodeTypes.Datasource,
  [NodeTypes.Router]: NodeTypes.Router,
  [NodeTypes.Task]: NodeTypes.Task,
};

const getNodeShape = (nodeType: string): JSX.Element => {
  const nodeShapes: Record<string, JSX.Element> = {
    [NodeShapes.offers]: (
      <rect width={baseunit(9)} height={baseunit(9)} rx={baseunit(0.3)} />
    ),
    [NodeShapes.default]: (
      <rect width={baseunit(20)} height={baseunit(4)} rx={baseunit(0.3)} />
    ),
    [NodeShapes.condition]: (
      <rect width={baseunit(20)} height={baseunit(4)} rx={baseunit(2)} />
    ),
    [NodeShapes.scorecard]: (
      <rect width={baseunit(9)} height={baseunit(9)} rx={baseunit(0.3)} />
    ),
    [NodeShapes.datasource]: (
      <circle cx={baseunit(4.5)} cy={baseunit(4.5)} r={baseunit(4.5)} />
    ),
    [NodeShapes.router]: (
      <path
        x={baseunit(1)}
        y={baseunit(-1)}
        d={
          `M ${baseunit(1)},${baseunit(0)} L ${baseunit(19)},${baseunit(
            0,
          )} L ${baseunit(20)},${baseunit(1)} ` +
          `L ${baseunit(20)},${baseunit(3)} L ${baseunit(19)},${baseunit(
            4,
          )} L ${baseunit(1)},${baseunit(4)} ` +
          `L ${baseunit(0)},${baseunit(3)} L ${baseunit(0)},${baseunit(1)} z`
        }
      />
    ),
    [NodeShapes.task]: (
      <path
        x={baseunit(1)}
        y={baseunit(-1)}
        d={
          `M ${baseunit(1)},${baseunit(0)} L ${baseunit(19)},${baseunit(
            0,
          )} L ${baseunit(21)},${baseunit(2)} ` +
          `L ${baseunit(19)},${baseunit(4)} L ${baseunit(1)},${baseunit(
            4,
          )} L ${baseunit(-1)},${baseunit(2)} z`
        }
      />
    ),
  };
  return nodeShapes[nodeType];
};

const bigNode = (type: NodeTypes): boolean => {
  const bigNodes = [
    NodeTypes.Datasource,
    NodeTypes.OfferCard,
    NodeTypes.ScoreCard,
  ];
  return bigNodes.includes(type);
};

const getNodeDimensions = (
  type: string,
): { W: number; H: number; view: string; isBigNode: boolean } => {
  const isBigNode = bigNode(type as NodeTypes);

  const normalDimensions = {
    W: baseunit(24),
    H: baseunit(6),
    view: `${baseunit(-2)} ${baseunit(-1)} ${baseunit(24)} ${baseunit(6)}`,
    isBigNode,
  };

  const bigDimensions = {
    W: baseunit(12),
    H: baseunit(12),
    view: `${baseunit(-1.9)} ${baseunit(-1)} ${baseunit(12)} ${baseunit(12)}`,
    isBigNode,
  };

  return isBigNode ? bigDimensions : normalDimensions;
};

interface INodeShapeProps {
  type: string;
  highlighted: boolean;
  selected: boolean;
  empty: boolean;
  error: boolean;
}

const DefineNodeShapes = (): JSX.Element => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="node-shape-shadow">
          <feDropShadow
            dx={baseunit(0)}
            dy={baseunit(0.2)}
            stdDeviation="4"
            floodColor="black"
            floodOpacity="0.2"
          />
        </filter>
        {Object.keys(NodeShapes).map((type) => {
          const { W, H } = getNodeDimensions(type);
          const id = `${type}-node`;
          return (
            <g
              key={id}
              id={id}
              strokeWidth={baseunit(0.2)}
              filter="url(#node-shape-shadow)"
            >
              <rect
                x={baseunit(-2)}
                y={baseunit(-1)}
                width={W}
                height={H}
                fill="none"
                stroke="none"
              />
              {getNodeShape(type)}
            </g>
          );
        })}
      </defs>
    </svg>
  );
};

const NodeShape = ({
  type,
  highlighted,
  selected,
  empty,
  error,
}: INodeShapeProps): JSX.Element => {
  const { W, H, view, isBigNode } = getNodeDimensions(type);
  const typeOrDefault = !NodeShapes[type] ? 'default' : type;
  return (
    <div>
      <svg
        style={{ cursor: 'pointer' }}
        stroke={selected ? '#0cc' : '#eee'}
        fill={selected ? '#cff' : '#fff'}
        xmlns="http://www.w3.org/2000/svg"
        width={W}
        height={H}
        viewBox={view}
      >
        <use href={`#${typeOrDefault}-node`} />
      </svg>
    </div>
  );
};

const Connector = ({ p1, p2 }: { p1: any; p2: any }): JSX.Element => {
  if (!p1 || !p2) {
    return <svg />;
  }
  let { x: x1, y: y1 } = p1;
  let { x: x2, y: y2 } = p2;
  x1 += 220;
  y1 += 24;
  x2 += 20;
  y2 += 26;
  if (y2 < y1) {
    y2 = y1 + 2;
  }

  const dy = y2 - y1;
  const dx = x2 - x1;

  return (
    <svg
      style={{ position: 'absolute', left: x1, top: y1 }}
      stroke="#000"
      strokeWidth={2}
      strokeOpacity={0.2}
      fill="none"
      width={dx}
      height={Math.max(100, dy + 10)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {y2 - y1 < 40 ? (
        <line x1={0} y1={0} x2={dx} y2={dy} />
      ) : (
        <path
          d={
            'M 0 0 ' +
            `L ${dx / 2 - 20} 0` +
            `C ${dx / 2 - 20} 0 ${dx / 2} 0 ${dx / 2} 20 ` +
            `L ${dx / 2} 20 ${dx / 2} ${dy - 20} ` +
            `C ${dx / 2} ${dy - 20} ${dx / 2} ${dy} ${dx / 2 + 20} ${dy} ` +
            `L ${dx / 2 + 20} ${dy} ${dx} ${dy}`
          }
        />
      )}
    </svg>
  );
};

export { NodeShape, DefineNodeShapes, Connector };
