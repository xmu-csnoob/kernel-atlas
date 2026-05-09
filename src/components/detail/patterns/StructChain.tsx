import React from 'react';
import { StructCard } from '../primitives';
import AnimatedArrow from '../primitives/AnimatedArrow';
import { space } from '../../../design/tokens';
import type { Region } from '../../../design/tokens';

interface FieldDef {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ChainCard {
  structName: string;
  type?: string;
  fields: FieldDef[];
  region?: Region;
  width?: string | number;
}

interface ChainArrow {
  label?: string;
  subLabel?: string;
  width?: number;
}

interface StructChainProps {
  cards: ChainCard[];
  arrows: ChainArrow[];
}

/**
 * Renders a horizontal chain of StructCards connected by AnimatedArrows.
 *
 * cards.length must equal arrows.length + 1.
 */
const StructChain: React.FC<StructChainProps> = ({ cards, arrows }) => {
  if (cards.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: space[2],
        flexWrap: 'wrap',
      }}
    >
      {cards.map((card, i) => (
        <React.Fragment key={i}>
          <StructCard
            name={card.structName}
            type={card.type}
            region={card.region}
            fields={card.fields}
            width={card.width}
          />
          {i < arrows.length && (
            <AnimatedArrow
              label={arrows[i].label}
              subLabel={arrows[i].subLabel}
              width={arrows[i].width ?? 100}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StructChain;
export type { ChainCard, ChainArrow, FieldDef };
