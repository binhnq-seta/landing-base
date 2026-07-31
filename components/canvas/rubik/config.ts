// ─── Cube geometry ────────────────────────────────────────────────────────────
export const PIECE_SIZE   = 0.94
export const PIECE_RADIUS = 0.08
export const CUBE_STEP    = 1.0

// Cube tilt: positive X shows the TOP face toward the camera
// π/6 (30°): front face dominates, right side face slightly visible.
// At this angle the top-face diagonal running from the near-right corner
// toward the far-left corner appears nearly vertical — aligned with the
// right side edge of the front face, as requested.
export const CUBE_ROT_Y = Math.PI / 6
export const CUBE_ROT_X = 0.40          // ~23° forward tilt — top face visible

// ─── Icon types ───────────────────────────────────────────────────────────────
export type IconType = 'shield' | 'layers' | 'signal' | 'bolt' | 'lock' | 'plane'

// ─── Wing definitions ─────────────────────────────────────────────────────────
//
// Architecture:
//   Wings extend FROM the cube. The Rubik sits at the center and
//   depth-occludes the wing's inner base — only the outer portion is visible,
//   making each wing appear to "grow out of" the cube.
//
//   Each wing has:
//     • hingePos  — starting position for the fold/open animation (near cube centre)
//     • openPos   — panel centre when the wing is fully deployed
//     • rotX      — forward lean: negative value tilts outer tip toward the viewer,
//                   inner base away. Same value works for all wings because rotZ
//                   only rotates in the XY plane and does not change the Z axis,
//                   so the Z-lean from rotX is preserved after rotZ is applied.
//     • rotY      — side tilt (keep 0 for all wings in this layout)
//     • rotZ      — direction the wing apex points in the XY plane:
//                     0       = upward        (top triangle)
//                     π       = downward      (bottom triangle)
//                     π/4     = upper-left    (UL petal)
//                    −π/4     = upper-right   (UR petal)
//                     3π/4    = lower-left    (LL petal)
//                    −3π/4    = lower-right   (LR petal)
//     • shapeType — 'triangle' (top/bottom) or 'petal' (4 diagonals)
//
// Coordinate space: sceneGroup local (wraps cube + wings, before HERO_SCALE).
//   Cube pieces span ±1.47 in X, Y, Z (CUBE_STEP + PIECE_SIZE/2 = 1.47).
//   Wings at openPos=[±1.4, ±1.4, 0.3], inner base at ±≈0.7 — well inside cube.
//
export interface WingDef {
  id: string
  line1: string
  line2: string
  iconType: IconType
  /** Starting position for the opening animation (inside/near cube) */
  hingePos: [number, number, number]
  /** Panel centre when the wing is fully open */
  openPos: [number, number, number]
  /** Forward lean — outer tip toward viewer. Use -0.28 for all wings. */
  rotX: number
  /** Y-axis tilt — keep 0 */
  rotY: number
  /** Z-axis rotation — sets apex direction in XY plane */
  rotZ: number
  /** Triangle (top/bottom) or petal/pentagon (4 diagonals) */
  shapeType: 'triangle' | 'petal'
  order: number
}

// Backward-compat aliases
/** @deprecated Use WingDef */
export type SolutionDef = WingDef
/** @deprecated Use WINGS */
export const SOLUTIONS: WingDef[] = []

export interface ShowcaseCorner {
  /** Stable identifier — matched against CMSShowcaseCorner.id to overlay CMS data */
  id?: string
  pieceIndex: number
  dir: [number, number, number]
  rotX: number
  rotY: number
  label: string
  sublabel: string
  image: string
}

const _iso  = Math.atan2( 1, Math.SQRT2)
const _isoN = Math.atan2(-1, Math.SQRT2)
const N = 1 / Math.sqrt(3)

export const SHOWCASE_CORNERS: ShowcaseCorner[] = [
  // Top corners first (bloom upward from bottom-right Rubik toward panel)
  { id: 'integration', pieceIndex: 20, dir: [-N, N, N], rotX: _iso,  rotY: Math.atan2( 1, 1), label: 'GIẢI PHÁP', sublabel: 'TÍCH HỢP',   image: '/image/solution/integration.jpg'},
  { id: 'security',    pieceIndex: 18, dir: [-N, N,-N], rotX: _iso,  rotY: Math.atan2( 1,-1), label: 'BẢO MẬT',   sublabel: 'ATTT',        image: '/image/solution/security.jpg'   },
  { id: 'digital',     pieceIndex: 26, dir: [ N, N, N], rotX: _iso,  rotY: Math.atan2(-1, 1), label: 'CÔNG NGHỆ', sublabel: 'SỐ',          image: '/image/solution/integration.jpg'},
  { id: 'network',     pieceIndex: 24, dir: [ N, N,-N], rotX: _iso,  rotY: Math.atan2(-1,-1), label: 'HẠ TẦNG',   sublabel: 'MẠNG',        image: '/image/solution/tele.jpg'       },
  // Bottom corners
  { id: 'military',    pieceIndex: 0,  dir: [-N,-N,-N], rotX: _isoN, rotY: Math.atan2( 1,-1), label: 'AN NINH',   sublabel: 'QUỐC PHÒNG', image: '/image/solution/military.jpg'   },
  { id: 'telecom',     pieceIndex: 2,  dir: [-N,-N, N], rotX: _isoN, rotY: Math.atan2( 1, 1), label: 'VIỄN THÔNG',sublabel: '',            image: '/image/solution/tele.jpg'       },
  { id: 'aviation',    pieceIndex: 8,  dir: [ N,-N, N], rotX: _isoN, rotY: Math.atan2(-1, 1), label: 'HÀNG KHÔNG',sublabel: '',            image: '/image/solution/air.jpg'        },
  { id: 'energy',      pieceIndex: 6,  dir: [ N,-N,-N], rotX: _isoN, rotY: Math.atan2(-1,-1), label: 'ĐIỆN LỰC',  sublabel: 'NĂNG LƯỢNG', image: '/image/solution/energy.jpg'     },
]

export const WINGS: WingDef[] = [
  // ── Top — apex points upward ───────────────────────────────────────────────
  {
    id: 'giai-phap-tich-hop',
    line1: 'GIẢI PHÁP', line2: 'TÍCH HỢP', iconType: 'layers',
    hingePos: [0,  0.4, 0.3],
    openPos:  [0,  2.2, 0.3],
    rotX: -0.28, rotY: 0, rotZ: 0,
    shapeType: 'triangle',
    order: 1,
  },

  // ── Bottom — apex points downward ─────────────────────────────────────────
  {
    id: 'bao-mat-attt',
    line1: 'BẢO MẬT', line2: 'ATTT', iconType: 'lock',
    hingePos: [0, -0.4, 0.3],
    openPos:  [0, -2.2, 0.3],
    rotX: -0.28, rotY: 0, rotZ: Math.PI,
    shapeType: 'triangle',
    order: 4,
  },

  // ── Upper-left — apex points upper-left ───────────────────────────────────
  {
    id: 'an-ninh-quoc-phong',
    line1: 'AN NINH', line2: 'QUỐC PHÒNG', iconType: 'shield',
    hingePos: [-0.4,  0.4, 0.2],
    openPos:  [-2.0,  2.0, 0.3],
    rotX: -0.28, rotY: 0, rotZ:  Math.PI / 4,
    shapeType: 'petal',
    order: 0,
  },

  // ── Upper-right — apex points upper-right ─────────────────────────────────
  {
    id: 'vien-thong',
    line1: 'VIỄN THÔNG', line2: '', iconType: 'signal',
    hingePos: [ 0.4,  0.4, 0.2],
    openPos:  [ 2.0,  2.0, 0.3],
    rotX: -0.28, rotY: 0, rotZ: -Math.PI / 4,
    shapeType: 'petal',
    order: 2,
  },

  // ── Lower-left — apex points lower-left ───────────────────────────────────
  {
    id: 'dien-luc-nang-luong',
    line1: 'ĐIỆN LỰC', line2: 'NĂNG LƯỢNG', iconType: 'bolt',
    hingePos: [-0.4, -0.4, 0.2],
    openPos:  [-2.0, -2.0, 0.3],
    rotX: -0.28, rotY: 0, rotZ:  Math.PI * 3 / 4,
    shapeType: 'petal',
    order: 3,
  },

  // ── Lower-right — apex points lower-right ─────────────────────────────────
  {
    id: 'hang-khong',
    line1: 'HÀNG KHÔNG', line2: '', iconType: 'plane',
    hingePos: [ 0.4, -0.4, 0.2],
    openPos:  [ 2.0, -2.0, 0.3],
    rotX: -0.28, rotY: 0, rotZ: -Math.PI * 3 / 4,
    shapeType: 'petal',
    order: 5,
  },
]
