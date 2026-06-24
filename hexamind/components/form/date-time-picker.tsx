import { useCallback, useRef, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { View } from '@/components/themed-view'
import { Text } from '@/components/themed-text'
import AntDesign from '@expo/vector-icons/AntDesign'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

// DateTimePicker 只有 iOS/Android 才 import，web 端不走这个分支
let NativeDateTimePicker: typeof import('@react-native-community/datetimepicker').default | null = null
if (Platform.OS !== 'web') {
  NativeDateTimePicker =
    require('@react-native-community/datetimepicker').default
}

export interface DateTimePickerProps {
  /** 时间戳（毫秒） */
  value: number
  /** 值变化回调 */
  onChange: (value: number) => void
  /** 自定义容器样式 */
  className?: string
  /** 自定义容器 style */
  style?: any
}

/**
 * 跨平台日期时间选择器
 *
 * - Web: 原生 `<input type="datetime-local">`
 * - iOS: 原生 `mode="datetime"` spinner（一个 picker 同时选日期+时间）
 * - Android: 原生 date picker → 选完自动弹出 time picker
 *
 * 用法：
 * ```tsx
 * <DateTimePicker value={timestamp} onChange={setTimestamp} />
 * ```
 */
export default function DateTimePicker({
  value,
  onChange,
  className,
  style,
}: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const isWeb = Platform.OS === 'web'
  const displayDate = new Date(value)

  // =========== Web ===========
  const inputId = useRef(
    `dtpicker-${Math.random().toString(36).slice(2, 8)}`,
  ).current

  const formattedDateTime = `${displayDate.getFullYear()}/${String(displayDate.getMonth() + 1).padStart(2, '0')}/${String(displayDate.getDate()).padStart(2, '0')} ${String(displayDate.getHours()).padStart(2, '0')}:${String(displayDate.getMinutes()).padStart(2, '0')}`

  const handleWebChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val) {
        onChange(new Date(val).getTime())
      }
    },
    [onChange],
  )

  const openWebPicker = useCallback(() => {
    const el = document.getElementById(inputId) as HTMLInputElement | null
    if (el?.showPicker) {
      el.showPicker()
    } else {
      el?.click()
    }
  }, [inputId])

  // =========== iOS datetime ===========
  const handleDateTimeChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      setShowDateTimePicker(false)
      if (selectedDate) {
        onChange(selectedDate.getTime())
      }
    },
    [onChange],
  )

  // =========== Android date ===========
  const handleDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      setShowDatePicker(false)
      if (selectedDate) {
        const newDate = new Date(value)
        newDate.setFullYear(selectedDate.getFullYear())
        newDate.setMonth(selectedDate.getMonth())
        newDate.setDate(selectedDate.getDate())
        onChange(newDate.getTime())
      }
      // Android: date 选完后自动弹出 time picker
      setShowTimePicker(true)
    },
    [value, onChange],
  )

  // =========== Android time ===========
  const handleTimeChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      setShowTimePicker(false)
      if (selectedDate) {
        const newDate = new Date(value)
        newDate.setHours(selectedDate.getHours())
        newDate.setMinutes(selectedDate.getMinutes())
        newDate.setSeconds(0)
        onChange(newDate.getTime())
      }
    },
    [value, onChange],
  )

  const isIos = Platform.OS === 'ios'

  // =========== Web 渲染 ===========
  if (isWeb) {
    return (
      <View className={className} style={style}>
        <Pressable
          onPress={openWebPicker}
          className="w-full rounded-sm py-1.5 px-2 border border-white/10 bg-black/55 flex flex-row items-center justify-between"
        >
          <Text className="text-[12px] font-normal font-mono text-white/70 truncate">
            {formattedDateTime}
          </Text>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18" />
          </svg>
        </Pressable>
        <input
          id={inputId}
          type="datetime-local"
          value={displayDate.toISOString().slice(0, 16)}
          onChange={handleWebChange}
          style={{
            position: 'fixed',
            opacity: 0,
            pointerEvents: 'none',
            width: 0,
            height: 0,
          }}
          tabIndex={-1}
        />
      </View>
    )
  }

  // =========== iOS / Android 渲染 ===========
  return (
    <View className={className} style={style}>
      {/* 日期行 */}
      <Pressable
        onPress={() => (isIos ? setShowDateTimePicker(true) : setShowDatePicker(true))}
        className="flex flex-row items-center justify-between rounded-sm border border-white/10 p-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <Text className="text-white/80">
          {displayDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </Text>
        <AntDesign name="calendar" size={16} color="rgba(255,255,255,0.2)" />
      </Pressable>

      {/* 时间行（Android 单独一行，iOS 用 datetime 模式所以不单独显示） */}
      {isIos ? null : (
        <Pressable
          onPress={() => setShowTimePicker(true)}
          className="mt-2 flex flex-row items-center justify-between rounded-sm border border-white/10 p-2"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <Text className="text-white/80">
            {displayDate.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <MaterialIcons name="access-time" size={16} color="rgba(255,255,255,0.2)" />
        </Pressable>
      )}

      {/* iOS: datetime 模式 picker */}
      {isIos && showDateTimePicker && NativeDateTimePicker && (
        <NativeDateTimePicker
          value={displayDate}
          mode="datetime"
          display="spinner"
          onChange={handleDateTimeChange}
        />
      )}

      {/* Android: date picker */}
      {showDatePicker && NativeDateTimePicker && (
        <NativeDateTimePicker
          value={displayDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Android: time picker */}
      {showTimePicker && NativeDateTimePicker && (
        <NativeDateTimePicker
          value={displayDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}
