import { useState } from 'react';
import Nav from './components/Nav';
import SyscallSelector from './components/SyscallSelector';
import MainFlow from './components/MainFlow';
import DataStructDiagram from './components/DataStructDiagram';
import readData from './data/read.json';
import forkData from './data/fork.json';
import type { SyscallData } from './data/types';
import { color, font, space } from './design/tokens';

type View = 'syscall' | 'data-structures';
type SyscallId = 'read' | 'fork';

const SYSCALLS: { id: string; name: string }[] = [
  { id: 'read', name: 'read()' },
  { id: 'fork', name: 'fork()' },
];

const SYSCALL_DATA: Record<SyscallId, SyscallData> = {
  read: readData as unknown as SyscallData,
  fork: forkData as unknown as SyscallData,
};

function App() {
  const [activeView, setActiveView] = useState<View>('syscall');
  const [selectedSyscall, setSelectedSyscall] = useState<SyscallId>('read');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: color.bg.canvas,
        color: color.text.primary,
        fontFamily: font.family.sans,
      }}
    >
      <Nav activeView={activeView} onViewChange={setActiveView} />

      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${space[6]} ${space[5]}`,
        }}
      >
        {activeView === 'syscall' ? (
          <>
            <div style={{ marginBottom: space[5] }}>
              <SyscallSelector
                syscalls={SYSCALLS}
                selected={selectedSyscall}
                onSelect={id => setSelectedSyscall(id as SyscallId)}
              />
            </div>
            <MainFlow data={SYSCALL_DATA[selectedSyscall]} />
          </>
        ) : (
          <DataStructDiagram />
        )}
      </main>
    </div>
  );
}

export default App;
