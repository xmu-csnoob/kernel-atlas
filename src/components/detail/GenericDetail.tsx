import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { color, font, space } from '../../design/tokens';

const GenericDetail: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      hero={
        <div
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.base,
            color: color.text.secondary,
            lineHeight: 1.65,
            padding: `${space[2]} 0`,
          }}
        >
          {node.description}
        </div>
      }
    />
  );
};

export default GenericDetail;
