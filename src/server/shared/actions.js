export const STATUS_REQUEST = 'STATUS_REQUEST'
export const STATUS_FAIL = 'STATUS_FAIL'
export const STATUS_SUCCESS = 'STATUS_SUCCESS'

/**
 * Helpers
 */
export function request(action) {
  return { ...action, status: STATUS_REQUEST }
}

export function fail(action, error) {
  return { ...action, status: STATUS_FAIL, error }
}

export function succeed(action) {
  return { ...action, status: STATUS_SUCCESS }
}

/**
 * User Actions
 */
export const USER_LOGIN = 'USER_LOGIN'
export const userLogin = (name) => ({type: USER_LOGIN, name})

export const USER_DETAILS_SET = 'USER_DETAILS_SET'
export const userDetailsSet = (details) => ({type: USER_DETAILS_SET, details})