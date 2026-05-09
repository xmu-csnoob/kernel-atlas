/**
 * Linux Kernel Atlas — Data Schema
 *
 * Two-level interactive diagram hierarchy:
 *   SyscallData
 *     └─ MainFlowNode[]      (Level 1 — ~6 high-level nodes per syscall)
 *          └─ DetailNode[]   (Level 2 — expanded in-place on click)
 *
 * Covers syscalls: read(), fork()
 * Kernel source references target Linux 2.6.32 LTS.
 */

// ---------------------------------------------------------------------------
// Kernel Source Reference
// ---------------------------------------------------------------------------

/** A precise pointer into the Linux 2.6.32 LTS source tree. */
export interface SourceRef {
  /** Relative path from the kernel root, e.g. "fs/read_write.c" */
  file: string;
  /** 1-based line number of the primary reference site */
  line: number;
  /** Short verbatim code snippet (≤ 5 lines) illustrating the reference */
  snippet: string;
}

// ---------------------------------------------------------------------------
// Data-Structure Relationship View
// ---------------------------------------------------------------------------

/**
 * A kernel data structure shown in the data-structure relationship panel
 * (task_struct, file, inode, page cache, etc.).
 */
export interface DataStructureNode {
  /** Stable unique identifier, e.g. "task_struct" */
  id: string;
  /** Display name shown in the diagram */
  label: string;
  /**
   * C struct name as it appears in the kernel headers,
   * e.g. "struct task_struct"
   */
  struct_name: string;
  /** Short description of the struct's role */
  description: string;
  /** Key fields to highlight in the UI */
  key_fields: string[];
  /** Optional kernel source reference for the struct definition */
  source_ref: SourceRef | null;
}

/**
 * A directed relationship between two DataStructureNodes.
 * Represents a pointer/embedded-struct relationship in the kernel.
 */
export interface DataStructureEdge {
  /** Stable unique identifier for this edge */
  id: string;
  /** id of the source DataStructureNode */
  source_id: string;
  /** id of the target DataStructureNode */
  target_id: string;
  /**
   * Human-readable label for the relationship,
   * e.g. "files->fdt->fd[]" or "f_inode"
   */
  label: string;
  /**
   * Multiplicity indicator.
   * "one-to-one" | "one-to-many" | "many-to-many"
   */
  multiplicity: "one-to-one" | "one-to-many" | "many-to-many";
}

// ---------------------------------------------------------------------------
// Level-2: Detail Nodes
// ---------------------------------------------------------------------------

/**
 * A detail node that lives inside a MainFlowNode's expanded sub-graph.
 *
 * Every detail node has a type tag so the renderer can apply the correct
 * visual treatment (code panel, hardware block, etc.).
 */
export type DetailNodeType =
  | "code"       // Kernel code path / function call
  | "hardware"   // Hardware interaction (disk, DMA, IRQ …)
  | "concept"    // Architectural concept without a single code anchor
  | "data";      // Data-structure manipulation step

/** Base fields shared by every detail node. */
interface DetailNodeBase {
  /** Stable unique identifier within the parent MainFlowNode, e.g. "read-vfs-lookup" */
  id: string;
  /** Short display title */
  title: string;
  /** One-paragraph explanation shown in the detail panel */
  description: string;
  /**
   * IDs of DataStructureNodes that are prominently involved at this step.
   * Used to highlight relevant structs in the data-structure view.
   */
  data_structures: string[];
  /** Visual / semantic type used by the renderer */
  type: DetailNodeType;
}

/** A detail node with a kernel source reference anchor. */
export interface CodeDetailNode extends DetailNodeBase {
  type: "code" | "concept" | "data";
  /** Precise pointer into the Linux 2.6.32 LTS source; null when not applicable */
  source_ref: SourceRef | null;
  hw_description: null;
  /** SVG asset name for hardware diagrams; always null for non-hardware nodes */
  svg_asset: null;
}

/** A detail node representing a hardware interaction. */
export interface HardwareDetailNode extends DetailNodeBase {
  type: "hardware";
  source_ref: null;
  /** Human-readable description of the hardware operation (e.g. "DMA transfer from SATA disk") */
  hw_description: string | null;
  /**
   * Optional SVG asset filename (relative to /assets/svg/) that illustrates
   * the hardware interaction, e.g. "dma-transfer.svg"
   */
  svg_asset: string | null;
}

/**
 * Union type representing any detail node.
 * Discriminate on the `type` field when rendering.
 */
export type DetailNode = CodeDetailNode | HardwareDetailNode;

// ---------------------------------------------------------------------------
// Level-1: Main Flow Nodes
// ---------------------------------------------------------------------------

/**
 * A high-level step in the syscall execution path shown in the main diagram.
 * Clicking a MainFlowNode expands it in-place to reveal its DetailNode sub-graph.
 */
export interface MainFlowNode {
  /** Stable unique identifier, e.g. "read-vfs" */
  id: string;
  /** Short display title, e.g. "VFS Layer" */
  title: string;
  /** One-paragraph explanation shown before expanding */
  description: string;
  /**
   * IDs of DataStructureNodes prominently involved at this level.
   * Shown as highlighted chips on the main flow card.
   */
  data_structures: string[];
  /** Ordered list of detail nodes revealed when this node is expanded */
  detail_nodes: DetailNode[];
  /**
   * 0-based display position in the main flow diagram.
   * Nodes are rendered left-to-right (or top-to-bottom) in ascending order.
   */
  position: number;
}

// ---------------------------------------------------------------------------
// Syscall-level Data
// ---------------------------------------------------------------------------

/**
 * All data for a single Linux system call.
 */
export interface SyscallData {
  /** Stable identifier matching the syscall name, e.g. "read" | "fork" */
  id: string;
  /** Display name including parentheses, e.g. "read()" */
  name: string;
  /** Brief description of what the syscall does */
  description: string;
  /**
   * Ordered main-flow nodes (Level 1).
   * Typically 5-7 nodes covering the full call path from user space to
   * hardware (or scheduler for fork) and back.
   */
  main_flow: MainFlowNode[];
  /**
   * C-style function signature for display in the header panel,
   * e.g. "ssize_t read(int fd, void *buf, size_t count)"
   */
  signature: string;
  /** Linux 2.6.32 LTS kernel source entry point, e.g. "fs/read_write.c" */
  entry_point_file: string;
}

// ---------------------------------------------------------------------------
// Top-level Bundle
// ---------------------------------------------------------------------------

/**
 * Root data object loaded by the application at startup.
 * Bundles all syscall diagrams and the shared data-structure relationship graph.
 */
export interface KernelAtlasData {
  /** Schema version string for forward-compatibility checks, e.g. "1.0.0" */
  version: string;
  /** All syscalls included in this atlas (read, fork, …) */
  syscalls: SyscallData[];
  /** Shared data-structure relationship graph used across all syscall views */
  data_structures: {
    nodes: DataStructureNode[];
    edges: DataStructureEdge[];
  };
}
