import React from 'react';
import type { MainFlowNode } from '../../data/types';
import type { Region } from '../../design/tokens';
import { color, font, space, radius, regionPalette, REGION_LABEL, REGION_LABEL_ZH } from '../../design/tokens';
import { useLanguage } from '../../i18n/useLanguage';
import { zh } from '../../i18n/zh';
import { SourceCard } from './primitives';

export interface DetailViewProps {
  node: MainFlowNode;
  region: Region;
}

interface DetailLayoutProps extends DetailViewProps {
  hero?: React.ReactNode;
  heroLabel?: string;
}

/** Map known English hero labels to Chinese translations. */
function translateHeroLabel(en: string): string {
  const map: Record<string, string> = {
    'What the user process does': '用户进程行为',
    'syscall table dispatch and fd→file* lookup': '系统调用表分派与 fd→file* 查找',
    'VFS function pointer chase: file → f_op → read': 'VFS 函数指针追踪: file → f_op → read',
    'page cache lookup → cache miss → BIO submission': '页缓存查找 → 缓存未命中 → BIO 提交',
    'The hardware does the work — DMA + interrupt': '硬件执行 — DMA + 中断',
    'copy_to_user — kernel page → user buffer → return': 'copy_to_user — 内核页 → 用户缓冲区 → 返回',
    'glibc fork() → clone(SIGCHLD)': 'glibc fork() → clone(SIGCHLD)',
    'syscall 57 → do_fork() dispatch': '系统调用 57 → do_fork() 分派',
    'copy_process → dup_task_struct → alloc_pid': 'copy_process → dup_task_struct → alloc_pid',
    'copy_mm → CoW page tables': 'copy_mm → 写时复制页表',
    'sched_fork → wake_up_new_task → runqueue': 'sched_fork → wake_up_new_task → 运行队列',
    'parent gets PID, child gets 0': '父进程获得 PID，子进程获得 0',
    'glibc exit() → exit_group syscall': 'glibc exit() → exit_group 系统调用',
    'do_exit() — PF_EXITING → resource release chain': 'do_exit() — PF_EXITING → 资源释放链',
    'exit_mm() → mmput() → exit_mmap() → mmdrop()': 'exit_mm() → mmput() → exit_mmap() → mmdrop()',
    'exit_files() → put_files_struct() → close_files() → filp_close()': 'exit_files() → put_files_struct() → close_files() → filp_close()',
    'do_notify_parent() → SIGCHLD → wake_up_parent()': 'do_notify_parent() → SIGCHLD → wake_up_parent()',
    'TASK_DEAD → zombie → release_task() → free_pid()': 'TASK_DEAD → 僵尸 → release_task() → free_pid()',
    'wait4() → do_wait() → release_task() → task_struct freed': 'wait4() → do_wait() → release_task() → task_struct 释放',
  };
  return map[en] ?? en;
}

const DetailLayout: React.FC<DetailLayoutProps> = ({ node, region, hero, heroLabel }) => {
  const { lang } = useLanguage();
  const t = lang === 'zh' ? zh : null;
  const palette = regionPalette(region);

  return (
    <div
      style={{
        background: color.bg.surface,
        border: `1px solid ${palette.fg}33`,
        borderRadius: radius.xl,
        padding: space[5],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: palette.fg,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: space[4],
          paddingBottom: space[3],
          borderBottom: `1px solid ${color.border.subtle}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space[3] }}>
          <span
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: palette.fg,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              fontWeight: font.weight.bold,
            }}
          >
            {t ? REGION_LABEL_ZH[region] : REGION_LABEL[region]}
          </span>
          <span
            style={{
              fontFamily: font.family.sans,
              fontSize: font.size.lg,
              color: color.text.primary,
              fontWeight: font.weight.semibold,
              letterSpacing: font.letterSpacing.tight,
            }}
          >
            {node.title.replace(/\s—\s.*$/, '')}
          </span>
        </div>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
            letterSpacing: font.letterSpacing.wide,
          }}
        >
          Linux 2.6.32 LTS
        </span>
      </div>

      {/* Body — hero (left) + source refs (right) */}
      <div
        style={{
          display: 'flex',
          gap: space[6],
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Hero viz — takes remaining width */}
        {hero && (
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            {heroLabel && (
              <div
                style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: color.text.muted,
                  letterSpacing: font.letterSpacing.label,
                  textTransform: 'uppercase',
                  marginBottom: space[2],
                }}
              >
                {t ? translateHeroLabel(heroLabel) : heroLabel}
              </div>
            )}
            <div
              style={{
                background: color.bg.canvas,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: radius.lg,
                padding: space[4],
                overflow: 'auto',
              }}
            >
              {hero}
            </div>
          </div>
        )}

        {/* Source refs — fixed right column */}
        {node.detail_nodes.length > 0 && (
          <div style={{ flex: hero ? '0 0 320px' : '1 1 0', minWidth: 0 }}>
            <div
              style={{
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
                color: color.text.muted,
                letterSpacing: font.letterSpacing.label,
                textTransform: 'uppercase',
                marginBottom: space[3],
              }}
            >
              {t
                ? t.detail.sourceRefs.replace('{n}', String(node.detail_nodes.length))
                : `Source references — ${node.detail_nodes.length} kernel anchors`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
              {node.detail_nodes.map(dn => (
                <SourceCard key={dn.id} detailNode={dn} region={region} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailLayout;
