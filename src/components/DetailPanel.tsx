import React from 'react';
import type { MainFlowNode } from '../data/types';
import type { Region } from '../design/tokens';
import { regionOf } from '../design/tokens';
import { resolveDetailView } from './detail';

export interface DetailPanelProps {
  node: MainFlowNode;
  region?: Region;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, region }) => {
  const View = resolveDetailView(node.id, node.title);
  const resolvedRegion = region ?? regionOf(node.id);
  return <View node={node} region={resolvedRegion} />;
};

export default DetailPanel;
