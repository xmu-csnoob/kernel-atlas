import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import SyscallSelector from './components/SyscallSelector';
import SyscallPipeline from './components/SyscallPipeline';
import readData from './data/read.json';
import forkData from './data/fork.json';
import writeData from './data/write.json';
import openData from './data/open.json';
import mmapData from './data/mmap.json';
import execveData from './data/execve.json';
import socketData from './data/socket.json';
import ioctlData from './data/ioctl.json';
import cloneData from './data/clone.json';
import epollWaitData from './data/epoll_wait.json';
import exitData from './data/exit.json';
import brkData from './data/brk.json';
import readZhData from './data/read.zh.json';
import forkZhData from './data/fork.zh.json';
import writeZhData from './data/write.zh.json';
import openZhData from './data/open.zh.json';
import mmapZhData from './data/mmap.zh.json';
import execveZhData from './data/execve.zh.json';
import socketZhData from './data/socket.zh.json';
import ioctlZhData from './data/ioctl.zh.json';
import cloneZhData from './data/clone.zh.json';
import epollWaitZhData from './data/epoll_wait.zh.json';
import exitZhData from './data/exit.zh.json';
import brkZhData from './data/brk.zh.json';
import type { SyscallData } from './data/types';
import { color, font, space } from './design/tokens';
import { LanguageProvider } from './i18n/LanguageContext';
import { useLanguage } from './i18n/useLanguage';

type SyscallId = 'read' | 'fork' | 'write' | 'open' | 'mmap' | 'execve' | 'socket' | 'ioctl' | 'clone' | 'epoll_wait' | 'exit' | 'brk';

const SYSCALLS: { id: string; name: string }[] = [
  { id: 'read', name: 'read()' },
  { id: 'fork', name: 'fork()' },
  { id: 'write', name: 'write()' },
  { id: 'open', name: 'open()' },
  { id: 'mmap', name: 'mmap()' },
  { id: 'execve', name: 'execve()' },
  { id: 'socket', name: 'socket()' },
  { id: 'ioctl', name: 'ioctl()' },
  { id: 'clone', name: 'clone()' },
  { id: 'epoll_wait', name: 'epoll_wait()' },
  { id: 'exit', name: 'exit()' },
  { id: 'brk', name: 'brk()' },
];

const SYSCALL_DATA_EN: Record<SyscallId, SyscallData> = {
  read: readData as unknown as SyscallData,
  fork: forkData as unknown as SyscallData,
  write: writeData as unknown as SyscallData,
  open: openData as unknown as SyscallData,
  mmap: mmapData as unknown as SyscallData,
  execve: execveData as unknown as SyscallData,
  socket: socketData as unknown as SyscallData,
  ioctl: ioctlData as unknown as SyscallData,
  clone: cloneData as unknown as SyscallData,
  epoll_wait: epollWaitData as unknown as SyscallData,
  exit: exitData as unknown as SyscallData,
  brk: brkData as unknown as SyscallData,
};

const SYSCALL_DATA_ZH: Record<SyscallId, SyscallData> = {
  read: readZhData as unknown as SyscallData,
  fork: forkZhData as unknown as SyscallData,
  write: writeZhData as unknown as SyscallData,
  open: openZhData as unknown as SyscallData,
  mmap: mmapZhData as unknown as SyscallData,
  execve: execveZhData as unknown as SyscallData,
  socket: socketZhData as unknown as SyscallData,
  ioctl: ioctlZhData as unknown as SyscallData,
  clone: cloneZhData as unknown as SyscallData,
  epoll_wait: epollWaitZhData as unknown as SyscallData,
  exit: exitZhData as unknown as SyscallData,
  brk: brkZhData as unknown as SyscallData,
};

function AppContent() {
  const [selectedSyscall, setSelectedSyscall] = useState<SyscallId>('read');
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 1024);
  const { lang } = useLanguage();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentData = (lang === 'zh' ? SYSCALL_DATA_ZH : SYSCALL_DATA_EN)[selectedSyscall];

  const handleSyscallSelect = (id: string) => {
    setSelectedSyscall(id as SyscallId);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: color.bg.canvas,
        color: color.text.primary,
        fontFamily: font.family.sans,
      }}
    >
      <Nav />

      <main
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: isNarrow ? `${space[4]} ${space[3]}` : `${space[5]} ${space[5]}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
          <SyscallSelector
            syscalls={SYSCALLS}
            selected={selectedSyscall}
            onSelect={handleSyscallSelect}
          />
          <SyscallPipeline key={selectedSyscall} data={currentData} />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
