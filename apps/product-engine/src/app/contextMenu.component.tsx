import styled from 'styled-components';

const Menu = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

export const ContextMenu = ({ x, y, onAddNode }: { x: number, y: number, onAddNode: () => void }) => (
  <Menu style={{ top: y, left: x }}>
    <MenuItem onClick={onAddNode}>Add Node</MenuItem>
  </Menu>
);
