import { Chart } from 'chart.js'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import isoWeek from 'dayjs/plugin/isoWeek'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.extend(isoWeek)
dayjs.extend(buddhistEra)

const FORMATS = {
  datetime: 'D MMM BBBB, H:mm:ss',
  millisecond: 'H:mm:ss.SSS',
  second: 'H:mm:ss',
  minute: 'H:mm',
  hour: 'H:mm',
  day: 'D MMM',
  week: 'D MMM',
  month: 'MMM BBBB',
  quarter: 'Q - BBBB',
  year: 'BBBB',
}

Chart._adapters._date.override({
  _id: 'dayjs-adapter',

  formats() {
    return FORMATS
  },

  parse(value, unit) {
    if (value === null || typeof value === 'undefined') {
      return 0
    }
    const type = typeof value
    if (type === 'number' || value instanceof Date) {
      return dayjs(value).valueOf()
    } else if (type === 'string') {
      if (typeof unit === 'string') {
        return dayjs().add(value, unit).valueOf()
      } else {
        return dayjs(value).valueOf()
      }
    }
  },

  format(time, fmt) {
    return dayjs(time).locale('th').format(fmt)
  },

  add(time, amount, unit) {
    switch (unit) {
      case 'millisecond':
      case 'second':
      case 'minute':
      case 'hour':
      case 'day':
      case 'week':
      case 'month':
      case 'quarter':
      case 'year':
        return dayjs(time).add(amount, unit).valueOf()
      default:
        return time
    }
  },

  diff(time, amount, unit) {
    switch (unit) {
      case 'millisecond':
      case 'second':
      case 'minute':
      case 'hour':
      case 'day':
      case 'week':
      case 'month':
      case 'quarter':
      case 'year':
        return dayjs(time).subtract(amount, unit).valueOf()
      default:
        return 0
    }
  },

  startOf(time, unit, weekday) {
    switch (unit) {
      case 'second':
      case 'minute':
      case 'hour':
      case 'day':
      case 'isoWeek':
      case 'month':
      case 'quarter':
      case 'year':
        return dayjs(time).startOf(unit).valueOf()
      case 'week':
        return dayjs(time)
          .startOf(unit)
          .add(weekday || 0, 'day')
          .valueOf()
      default:
        return time
    }
  },

  endOf(time, unit) {
    switch (unit) {
      case 'second':
      case 'minute':
      case 'hour':
      case 'day':
      case 'week':
      case 'isoWeek':
      case 'month':
      case 'quarter':
      case 'year':
        return dayjs(time).endOf(unit).valueOf()
      default:
        return time
    }
  },
})
