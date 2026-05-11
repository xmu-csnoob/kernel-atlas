/**
 * Kernel Atlas — Chinese (zh-CN) UI translations
 *
 * Flat nested object covering all UI chrome strings.
 * Brand names, syscall names, and C identifiers stay in English.
 */

export const zh = {
  // ─── Nav bar ───────────────────────────────────────────────────────────────
  nav: {
    brand: 'Kernel Atlas',
    subBrand: 'Linux 2.6.32 LTS',
    tabSyscallFlow: '系统调用流程',
    tabDataStructures: '数据结构',
    langToggle: 'EN / 中',
  },

  // ─── Syscall selector ──────────────────────────────────────────────────────
  syscall: {
    label: '系统调用',
    read: 'read()',
    write: 'write()',
    open: 'open()',
    fork: 'fork()',
    clone: 'clone()',
    execve: 'execve()',
    exit: 'exit()',
    mmap: 'mmap()',
    brk: 'brk()',
    socket: 'socket()',
    epoll_wait: 'epoll_wait()',
    ioctl: 'ioctl()',
  },

  // ─── Playback controls ─────────────────────────────────────────────────────
  playback: {
    label: '播放控制',
    play: '播放',
    pause: '暂停',
    stepForward: '前进',
    stepBackward: '后退',
    reset: '重置',
    scrubberFormat: '[{step}/{total}] {label}',
  },

  // ─── Region labels (main flow lanes) ───────────────────────────────────────
  regions: {
    userSpace: '用户空间',
    kernel: '内核',
    hardware: '硬件',
    return: '返回',
    subUser: '环 3',
    subKernel: '环 0',
    subHardware: '设备',
    subReturn: '返回用户态',
  },

  // ─── SW/HW boundary ────────────────────────────────────────────────────────
  boundary: {
    swHw: '软 · 硬',
  },

  // ─── Node card ─────────────────────────────────────────────────────────────
  nodeCard: {
    collapse: '▴ 收起',
    expand: '▾ 展开',
  },

  // ─── Detail panel chrome ───────────────────────────────────────────────────
  detail: {
    panelHeader: 'Linux 2.6.32 LTS',
    sourceRefs: '源码引用 — {n} 个内核锚点',
    badgeCode: '[代码]',
    badgeConcept: '[概念]',
    badgeData: '[数据]',
    badgeHardware: '[硬件]',
    noKernelSource: '无内核源码',
    sourcePending: '源码待补充',
    hardwareOperation: '硬件操作',
  },

  // ─── StructCard type labels ────────────────────────────────────────────────
  structType: {
    userProcess: '用户进程',
    kernel: '内核',
    fsSpecific: '文件系统相关',
  },

  // ─── HardwareDiagram (generic component, not detail viz) ───────────────────
  hardwareDiagram: {
    title: 'Hardware Architecture',
    alt: 'Hardware I/O: Disk Read Path',
  },

  // ─── Ring boundary banner ──────────────────────────────────────────────────
  ringBoundary: {
    fromLabel: '用户态',
    fromRing: '环 3',
    toLabel: '内核态',
    toRing: '环 0',
    arrowLabel: '系统调用',
  },

  // ─── Generic detail hero labels ────────────────────────────────────────────
  hero: {
    syscallDispatch: '系统调用分派 → 内核入口',
    userToKernel: '用户空间 → 内核态切换',
    vfsLayer: 'VFS 抽象层',
    returnToUser: '返回用户空间',
    scheduler: '调度器集成',
  },

  // ─── Stage labels (playback scrubber) ──────────────────────────────────────
  stages: {
    read: [
      'read(3, buf, 4096)',
      'fd=3 → struct file*',
      'f_op->read 分派',
      '缓存未命中 → submit_bio',
      'DMA → 页缓存',
      '4096 → 用户缓冲区',
    ],
    fork: [
      'fork()',
      'do_fork(SIGCHLD)',
      '复制 task_struct',
      'mm + files + sighand',
      '运行队列 + 唤醒',
      'pid → 父进程',
    ],
  },
} as const;

export type ZhTranslations = typeof zh;
