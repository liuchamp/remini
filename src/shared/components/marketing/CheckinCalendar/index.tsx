import { View, Text } from '@tarojs/components'
import './index.scss'

interface CheckinCalendarProps {
  checkinDays: number[]
  continuousDays: number
  todayChecked: boolean
  onCheckin: () => void
}

export default function CheckinCalendar({
  checkinDays,
  continuousDays,
  todayChecked,
  onCheckin
}: CheckinCalendarProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const daysInMonth = new Date(year, month, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <View className='checkin-calendar'>
      <View className='calendar-header'>
        <Text className='month-text'>{year}年{month}月</Text>
        <View className='continuous-badge'>
          <Text className='continuous-text'>连续签到 {continuousDays} 天</Text>
        </View>
      </View>

      <View className='calendar-grid'>
        {days.map((day) => (
          <View
            key={day}
            className={`day-item ${checkinDays.includes(day) ? 'checked' : ''} ${day === today.getDate() ? 'today' : ''}`}
          >
            <Text className='day-text'>{day}</Text>
            {checkinDays.includes(day) && (
              <Text className='check-icon'>✓</Text>
            )}
          </View>
        ))}
      </View>

      <View className='checkin-section'>
        <View
          className={`checkin-btn ${todayChecked ? 'disabled' : ''}`}
          onClick={todayChecked ? undefined : onCheckin}
        >
          <Text className='checkin-text'>
            {todayChecked ? '已签到' : '立即签到'}
          </Text>
        </View>
      </View>
    </View>
  )
}
