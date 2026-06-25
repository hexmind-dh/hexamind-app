import { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, PanResponder, Pressable, View as RNView } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'
import { Text } from '@/components/themed-text'
import { View } from '@/components/themed-view'

// ============================================================
// Props
// ============================================================
interface KineticScratchPadProps {
  isFree: boolean
  onSubscriptionRequest: () => void
  kineticSpeed: number
  hasScratched: boolean
  onScratchUpdate: (speed: number, scratched: boolean) => void
  isLoading?: boolean
}

// ============================================================
// 粒子参数
// ============================================================
const PARTICLE_R = 5
const PARTICLE_GAP = PARTICLE_R * 2 + 2
const ERASE_R = 20

// ============================================================
// 刮刮乐板组件
// ============================================================
export function KineticScratchPad({
  isFree,
  onSubscriptionRequest,
  kineticSpeed,
  hasScratched: _hasScratched,
  onScratchUpdate,
  isLoading = false,
}: KineticScratchPadProps) {
  const { t } = useTranslation()

  // -- State（触发 UI 更新） --
  const [isRevealed, setIsRevealed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [svgDims, setSvgDims] = useState({ w: 340, h: 64 })
  const [erasedSet, setErasedSet] = useState<Set<string>>(new Set())

  // -- Refs（PanResponder 永久闭包读写） --
  const dimsRef = useRef({ w: 340, h: 64 })
  const erasedRef = useRef(new Set<string>())
  const isDrawingRef = useRef(false)
  const lastPtRef = useRef<{ x: number; y: number } | null>(null)
  const velocitiesRef = useRef<number[]>([])
  const lastTimeRef = useRef(0)
  const cumulativeRef = useRef(0)
  const viewPosRef = useRef({ x: 0, y: 0 })
  const innerRef = useRef<RNView>(null)
  const progressRef = useRef(0)

  // Props 转 ref
  const flagsRef = useRef({ isFree, isRevealed, isLoading })
  flagsRef.current = { isFree, isRevealed, isLoading }
  const onSubRef = useRef(onSubscriptionRequest)
  onSubRef.current = onSubscriptionRequest
  const onUpdateRef = useRef(onScratchUpdate)
  onUpdateRef.current = onScratchUpdate

  // ==========================================
  // 粒子网格（尺寸变化时重新生成）
  // ==========================================
  const particles = useMemo(() => {
    const { w, h } = svgDims
    const list: { id: string; cx: number; cy: number }[] = []
    const step = PARTICLE_GAP
    const margin = step
    for (let x = margin; x < w - margin; x += step) {
      const rowOffset = (Math.floor(x / step) % 2 === 0) ? step / 2 : 0
      for (let y = margin + rowOffset; y < h - margin; y += step) {
        list.push({ id: `${x.toFixed(0)}-${y.toFixed(0)}`, cx: x, cy: y })
      }
    }
    return list
  }, [svgDims])

  const particlesRef = useRef(particles)
  particlesRef.current = particles
  const totalCount = particles.length

  // ==========================================
  // 坐标提取
  // ==========================================
  const getPt = (evt: any): { x: number; y: number } | null => {
    const ne = evt.nativeEvent || evt
    if (ne.locationX != null && ne.locationY != null && ne.locationX >= 0 && ne.locationY >= 0) {
      return { x: ne.locationX, y: ne.locationY }
    }
    const px = ne.pageX ?? ne.x
    const py = ne.pageY ?? ne.y
    if (px != null && py != null) {
      const pos = viewPosRef.current
      return { x: px - pos.x, y: py - pos.y }
    }
    return null
  }

  // ==========================================
  // PanResponder（仅创建一次，所有逻辑内联，通过 ref 读写最新值）
  // ==========================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        const f = flagsRef.current
        if (f.isFree) { onSubRef.current(); return }
        if (f.isRevealed || f.isLoading) return

        const d = dimsRef.current
        const pt = getPt(evt)
        if (!pt || pt.x < 0 || pt.y < 0 || pt.x > d.w || pt.y > d.h) return

        isDrawingRef.current = true
        lastPtRef.current = pt
        lastTimeRef.current = Date.now()
        velocitiesRef.current = []
        cumulativeRef.current = 0

        // 擦除起点
        eraseAt(pt.x, pt.y)
      },

      onPanResponderMove: (evt) => {
        const f = flagsRef.current
        if (!isDrawingRef.current || f.isRevealed || f.isLoading) return

        const d = dimsRef.current
        const pt = getPt(evt)
        if (!pt || pt.x < 0 || pt.y < 0 || pt.x > d.w || pt.y > d.h) return

        const prev = lastPtRef.current
        if (!prev) return

        const dx = pt.x - prev.x
        const dy = pt.y - prev.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 2) return

        lastPtRef.current = pt

        // 插值擦除（防止快速滑动遗漏）
        const steps = Math.max(1, Math.ceil(dist / ERASE_R))
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          eraseAt(prev.x + dx * t, prev.y + dy * t)
        }

        // 速度
        const now = Date.now()
        const dt = now - lastTimeRef.current || 1
        lastTimeRef.current = now
        const vel = (dist / dt) * 45
        velocitiesRef.current.push(Math.min(120, Math.max(0.12, Number(vel.toFixed(3)))))

        cumulativeRef.current += dist

        if (progressRef.current >= 100) {
          isDrawingRef.current = false
          setIsRevealed(true)
          const v = velocitiesRef.current
          const avg = v.length > 0 ? v.reduce((a, b) => a + b, 0) / v.length : 1.23
          onUpdateRef.current(Number(avg.toFixed(3)), true)
        }
      },

      onPanResponderRelease: () => {
        const f = flagsRef.current
        if (!isDrawingRef.current || f.isRevealed || f.isLoading) return
        isDrawingRef.current = false
        setIsRevealed(true)
        const v = velocitiesRef.current
        const avg = v.length > 0 ? v.reduce((a, b) => a + b, 0) / v.length : 1.23
        onUpdateRef.current(Number(avg.toFixed(3)), true)
      },

      onPanResponderTerminate: () => {
        const f = flagsRef.current
        if (!isDrawingRef.current || f.isRevealed || f.isLoading) return
        isDrawingRef.current = false
        setIsRevealed(true)
        const v = velocitiesRef.current
        const avg = v.length > 0 ? v.reduce((a, b) => a + b, 0) / v.length : 1.23
        onUpdateRef.current(Number(avg.toFixed(3)), true)
      },
    }),
  ).current

  // ==========================================
  // eraseAt（内联，通过 particles 闭包访问，但 particles 只变一次）
  // ==========================================
  function eraseAt(x: number, y: number) {
    const s = erasedRef.current
    const pts = particlesRef.current
    let added = 0

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      if (s.has(p.id)) continue
      const dx = p.cx - x
      const dy = p.cy - y
      if (dx * dx + dy * dy <= ERASE_R * ERASE_R) {
        s.add(p.id)
        added++
      }
    }

    if (added > 0) {
      setErasedSet(new Set(s))
      const pct = (s.size / pts.length) * 100
      progressRef.current = pct
      setProgress(Math.min(100, pct))
    }
  }

  // ==========================================
  // 重置
  // ==========================================
  const resetBoard = useCallback(() => {
    isDrawingRef.current = false
    const fresh = new Set<string>()
    erasedRef.current = fresh
    setErasedSet(fresh)
    setProgress(0)
    setIsRevealed(false)
    lastPtRef.current = null
    velocitiesRef.current = []
    cumulativeRef.current = 0
    progressRef.current = 0
    onUpdateRef.current(1.23, false)
  }, [])

  // ==========================================
  // 布局
  // ==========================================
  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width > 0 && height > 0) {
      const d = { w: width, h: height }
      dimsRef.current = d
      setSvgDims(d)
    }
  }, [])

  const onInnerLayout = useCallback(() => {
    innerRef.current?.measureInWindow?.((x: number, y: number) => {
      viewPosRef.current = { x, y }
    })
  }, [])

  // ==========================================
  const pct = Math.min(100, progress)
  const progColor = pct < 30 ? '#ad46ff' : pct < 70 ? '#c084fc' : '#e879f9'
  const erasedCount = erasedSet.size
  const erasedPct = totalCount > 0 ? (erasedCount / totalCount) * 100 : 0

  // ==========================================
  // Render
  // ==========================================
  return (
    <View
      className="relative mt-3.5 rounded-sm border border-[#ad46ff]/30"
      style={{ backgroundColor: 'rgba(251,44,54,0.02)' }}
    >
      <View className="p-3.5">
        {/* 标题行 */}
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <Feather name="activity" size={14} color="#ad46ff" />
            <Text size={14} style={{ color: '#ad46ff' }} className="font-bold uppercase tracking-wider">
              {t('kineticPad')}
            </Text>
          </View>
          {(isRevealed || _hasScratched) && (
            <Pressable
              onPress={resetBoard}
              className="rounded-sm border border-purple-500/30 px-1.5 py-0.5"
              style={{ backgroundColor: 'rgba(173,70,255,0.05)' }}
            >
              <Text style={{ color: '#ad46ff' }} size={10}>
                {t('reset')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* 刮刮乐板 */}
        <View
          className="mt-4 overflow-hidden rounded-sm"
          style={{ height: 64 }}
          onLayout={onContainerLayout}
        >
          {/* 底层：显示内容 */}
          <View className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
            <View className="absolute inset-0 bg-purple-950/20" />
            {isRevealed ? (
              <View className="items-center z-10">
                <Text size={13} className="text-purple-300 font-mono tracking-wider">
                  {kineticSpeed.toFixed(3)} m/s²
                </Text>
                <Text size={10} className="text-purple-400/60 mt-0.5">
                  {t('kineticValue') || 'Kinetic Value'}
                </Text>
              </View>
            ) : (
              <Text size={11} className="text-purple-300/40 tracking-[3px] uppercase z-10">
                {'✦ ✦ ✦'}
              </Text>
            )}
          </View>

          {/* SVG 粒子雾面 + 透明手势面 */}
          {!isRevealed && (
            <>
              {/* SVG 粒子层 */}
              <Svg
                width={svgDims.w}
                height={svgDims.h}
                viewBox={`0 0 ${svgDims.w} ${svgDims.h}`}
                style={{ position: 'absolute', inset: 0, zIndex: 5 }}
                pointerEvents="none"
              >
                <Defs>
                  <SvgLinearGradient id="frostBg" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#23242f" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#2a2b38" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#181920" stopOpacity="1" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width={svgDims.w} height={svgDims.h} fill="url(#frostBg)" />
                <Rect
                  x="0" y="0" width={svgDims.w} height={svgDims.h}
                  fill="rgba(59,61,74,0.25)"
                />
                {particles.map((p) => (
                  <Circle
                    key={p.id}
                    cx={p.cx}
                    cy={p.cy}
                    r={PARTICLE_R}
                    fill="#3b3d4a"
                    opacity={erasedSet.has(p.id) ? 0 : 0.85}
                  />
                ))}
              </Svg>

              {/* 透明手势面（SVG 之上，捕获所有触摸） */}
              <RNView
                ref={innerRef}
                onLayout={onInnerLayout}
                {...panResponder.panHandlers}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  backgroundColor: 'transparent',
                }}
              />
            </>
          )}

          {/* 进度条 */}
          {!isRevealed && erasedPct > 0 && (
            <View
              className="absolute bottom-0 left-0 h-1 z-20 rounded-full"
              style={{ width: `${Math.min(100, erasedPct)}%`, backgroundColor: progColor }}
            />
          )}
        </View>
      </View>

      {/* Free 锁定遮罩 */}
      {isFree && (
        <View className="absolute inset-0 z-25 flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#ad46ff]/40 bg-black/90 p-4">
          <Text className="font-bold uppercase tracking-wider text-white/50">
            {t('kineticLocked')}
          </Text>
          <Text size={14} className="mt-1.5 max-w-[260px] text-center text-white/50 leading-relaxed">
            {t('kineticLockedDesc')}
          </Text>
        </View>
      )}
    </View>
  )
}
