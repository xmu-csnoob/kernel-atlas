import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import StructChain from './patterns/StructChain';
import { color, space } from '../../design/tokens';

export const OpenPathLookupHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Path walk chain */}
    <StructChain
      cards={[
        {
          structName: 'nameidata',
          type: 'path walk state',
          region: 'vfs',
          fields: [
            { label: 'path.dentry', value: '→ cwd', highlight: true },
            { label: 'path.mnt', value: '→ vfsmount' },
            { label: 'flags', value: 'LOOKUP_OPEN' },
            { label: 'last_type', value: 'LAST_NORM' },
          ],
        },
        {
          structName: 'dentry',
          type: 'cwd',
          region: 'vfs',
          fields: [
            { label: 'd_name', value: '"/home/user"' },
            { label: 'd_inode', value: '→ inode (dir)' },
            { label: 'd_subdirs', value: '{..., passwd, ...}' },
            { label: 'd_op', value: 'ext2_dentry_ops' },
          ],
        },
        {
          structName: 'dentry',
          type: 'passwd',
          region: 'vfs',
          fields: [
            { label: 'd_name', value: '"passwd"', highlight: true },
            { label: 'd_inode', value: '→ inode #4821' },
            { label: 'd_parent', value: '→ cwd' },
            { label: 'd_sb', value: '→ sda1 superblock' },
          ],
        },
      ]}
      arrows={[
        { label: 'do_lookup', subLabel: 'fs/namei.c', width: 100 },
        { label: 'd_lookup', subLabel: 'dcache hit', width: 100 },
      ]}
    />

    {/* nameidata struct + code */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="nameidata"
        type="include/linux/namei.h"
        region="vfs"
        fields={[
          { label: 'path', value: '(dentry, mnt)', highlight: true },
          { label: 'last', value: 'qstr {name, len, hash}' },
          { label: 'root', value: 'process root' },
          { label: 'depth', value: '0' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.vfs.fg}>link_path_walk loop</SectionLabel>
        <CodeBlock compact>{`for (;;) {
    // 1. check exec permission on current dir
    err = exec_permission_lite(inode);

    // 2. lookup next component in dcache
    err = do_lookup(nd, &this, &next);

    // 3. follow mount points / symlinks
    err = follow_managed(&next, nd);

    // 4. advance to next component
    nd->path = next;
    if (!*name)
        break;   // final component reached
}`}</CodeBlock>
      </div>
    </div>
  </div>
);

const OpenPathLookup: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="Path walk: cwd → ./ → passwd"
    hero={<OpenPathLookupHero />}
  />
);

export default OpenPathLookup;
