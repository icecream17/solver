// This file is currently unused
import { ReportCallback, onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
   if (onPerfEntry instanceof Function) {
      onCLS(onPerfEntry)
      onINP(onPerfEntry)
      onFCP(onPerfEntry)
      onLCP(onPerfEntry)
      onTTFB(onPerfEntry)
   }
}

export default reportWebVitals
