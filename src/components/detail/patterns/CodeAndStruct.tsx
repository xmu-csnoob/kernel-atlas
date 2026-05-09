import React from 'react';
import { StructCard, CodeBlock, SectionLabel } from '../primitives';
import { space } from '../../../design/tokens';
import type { Region } from '../../../design/tokens';

interface FieldDef {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CodeAndStructProps {
  code: string;
  codeLabel?: string;
  structName: string;
  structType?: string;
  structFields: FieldDef[];
  structRegion?: Region;
  structWidth?: string | number;
}

/**
 * Side-by-side layout: CodeBlock on the left, StructCard on the right.
 * Common in kernel entry and return path nodes.
 */
const CodeAndStruct: React.FC<CodeAndStructProps> = ({
  code,
  codeLabel,
  structName,
  structType,
  structFields,
  structRegion,
  structWidth,
}) => {
  return (
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: '240px' }}>
        {codeLabel && (
          <SectionLabel>{codeLabel}</SectionLabel>
        )}
        <CodeBlock compact>{code}</CodeBlock>
      </div>
      <StructCard
        name={structName}
        type={structType}
        region={structRegion}
        fields={structFields}
        width={structWidth}
      />
    </div>
  );
};

export default CodeAndStruct;
export type { FieldDef };
