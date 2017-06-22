export * from '../server/shared/actions'

/**
 * app store
 */
export const DIALOG_SET = 'DIALOG_SET'
export const dialogSet = (id, isOpen, props = {}) => ({type: DIALOG_SET, id, isOpen, props})

export const DIALOG_LOGIN = 'DIALOG_LOGIN'

export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED'
export const CONNECTION_CONNECTING = 'CONNECTION_CONNECTING'
export const CONNECTION_RECONNECTING = 'CONNECTION_RECONNECTING'
export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED'

export const APP_CONNECTION_SET = 'APP_CONNECTION_SET'
export const appConnectionSet = (connection) => ({type: APP_CONNECTION_SET, connection})

export const APP_CONNECTION_RECONNECTED = 'APP_CONNECTION_RECONNECTED'
export const appConnectionReconnected = () => ({type: APP_CONNECTION_RECONNECTED})