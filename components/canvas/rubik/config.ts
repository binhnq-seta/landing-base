// ─── Cube geometry ────────────────────────────────────────────────────────────
export const PIECE_SIZE   = 0.94
export const PIECE_RADIUS = 0.08
export const CUBE_STEP    = 1.0

// Initial cube orientation: front vertical edge (GS logo) faces the camera
export const CUBE_ROT_Y = Math.PI / 4   // 45° — one corner toward viewer
export const CUBE_ROT_X = -0.52         // ~30° tilt so the top face is visible

// ─── Icon types ───────────────────────────────────────────────────────────────
export type IconType = 'shield' | 'layers' | 'signal' | 'bolt' | 'lock' | 'plane'

// ─── Wing definitions ─────────────────────────────────────────────────────────
//
// Architecture:
//   The Rubik cube is the center product — never modified by wings.
//   The six wings are independent UI modules that orbit the cube.
//
//   Each wing has:
//     • hingePos  — small mechanical joint anchored near the cube surface
//     • openPos   — panel center when the wing is fully deployed
//
//   At hero time all wings are open.
//   On scroll they fold inward (toward hingePos) then the cube translates alone.
//
// Coordinate space: sceneGroup local (the group wrapping both cube + wings).
//   HERO_SCALE = 0.42, so these local units × 0.42 = world units.
//   Cube silhouette in this space: ±2.12 in X, ±1.7 in Y (after 45° rotation).
//
export interface WingDef {
  id: string
  line1: string
  line2: string
  iconType: IconType
  /** Mechanical arm anchor — sits just outside the cube silhouette */
  hingePos: [number, number, number]
  /** Panel centre when the wing is fully open */
  openPos: [number, number, number]
  /** Panel face tilt — slight inward lean toward cube centre */
  rotY: number
  order: number
}

// Backward-compat aliases (SolutionPanel.tsx still compiles until removed)
/** @deprecated Use WingDef */
export type SolutionDef = WingDef
/** @deprecated Use WINGS */
export const SOLUTIONS: WingDef[] = []

export const WINGS: WingDef[] = [
  {
    id: 'an-ninh-quoc-phong',
    line1: 'AN NINH', line2: 'QUỐC PHÒNG', iconType: 'shield',
    hingePos: [-2.0, 1.0, 0.2],
    openPos:  [-3.0, 1.6, 0.3],
    rotY: 0.28,
    order: 0,
  },
  {
    id: 'giai-phap-tich-hop',
    line1: 'GIẢI PHÁP', line2: 'TÍCH HỢP', iconType: 'layers',
    hingePos: [0, 1.9, 0.3],
    openPos:  [0, 2.8, 0.4],
    rotY: 0,
    order: 1,
  },
  {
    id: 'vien-thong',
    line1: 'VIỄN THÔNG', line2: '', iconType: 'signal',
    hingePos: [1.8, 0.8, 0.2],
    openPos:  [2.7, 1.2, 0.3],
    rotY: -0.28,
    order: 2,
  },
  {
    id: 'dien-luc-nang-luong',
    line1: 'ĐIỆN LỰC', line2: 'NĂNG LƯỢNG', iconType: 'bolt',
    hingePos: [-2.0, -1.0, 0.2],
    openPos:  [-3.0, -1.5, 0.3],
    rotY: 0.28,
    order: 3,
  },
  {
    id: 'bao-mat-attt',
    line1: 'BẢO MẬT', line2: 'ATTT', iconType: 'lock',
    hingePos: [0, -1.9, 0.3],
    openPos:  [0, -2.8, 0.4],
    rotY: 0,
    order: 4,
  },
  {
    id: 'hang-khong',
    line1: 'HÀNG KHÔNG', line2: '', iconType: 'plane',
    hingePos: [1.8, -0.65, 0.2],
    openPos:  [2.7, -1.0, 0.3],
    rotY: -0.28,
    order: 5,
  },
]
