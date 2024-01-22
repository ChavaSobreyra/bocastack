import dayjs, { extend } from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import dayjsBusinessTime from 'dayjs-business-time'

extend(utc)
extend(timezone)
extend(dayjsBusinessTime)

dayjs.tz.setDefault('America/New_York')

export default defineNuxtPlugin(() => {
  return {
    provide: {
      dayjs,
    },
  }
})
