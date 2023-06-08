import Vue from 'vue'
import { library, config } from '@fortawesome/fontawesome-svg-core'
import {
  faSync,
  faFileExport,
  faDatabase,
  faEye,
  faEyeSlash,
  faBars,
  faTimes,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import {
  faTimesCircle,
  faCheckCircle,
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

config.autoAddCss = false

library.add(
  faSync,
  faFileExport,
  faDatabase,
  faEye,
  faEyeSlash,
  faBars,
  faTimes,
  faInfoCircle,
  faTimesCircle,
  faCheckCircle
)

Vue.component('FontAwesomeIcon', FontAwesomeIcon)
