# Kernel Atlas

An interactive visualizer for Linux syscall internals, based on Linux 2.6.32 LTS.

**Live**: [xmu-csnoob.github.io/kernel-atlas](https://xmu-csnoob.github.io/kernel-atlas)

---

## What it is

Kernel Atlas traces what actually happens inside the kernel when you call a syscall. Each syscall is broken into stages — from the userspace wrapper through the kernel entry, VFS, storage stack, hardware I/O, and back. Every stage shows the key data structures, source references, and a visualization of the execution path.

Supported syscalls: `read`, `write`, `open`, `mmap`, `fork`, `clone`, `execve`, `exit`, `socket`, `ioctl`, `epoll_wait`, `brk`

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Building

```bash
npm run build   # outputs to dist/
npm run preview # serve the build locally
```

## E2E tests

```bash
npx playwright install chromium
npm run test:e2e
```

---

## Stack

- React 18 + TypeScript
- Vite
- Playwright (E2E)

## Source references

All kernel source links point to [elixir.bootlin.com](https://elixir.bootlin.com/linux/v2.6.32/source) (Linux 2.6.32).
