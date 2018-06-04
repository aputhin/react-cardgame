export * from './shared/actions'

export const GAME_DISPOSED = 'GAME_DISPOSED'
export const gameDisposed = gameId => ({ type: GAME_DISPOSED, gameId })

export const PLAYER_DISPOSED = 'PLAYER_DISPOSED'
export const playerDisposed = (gameId, playerId) => ({ type: PLAYER_DISPOSED, gameId, playerId })

export const GAME_SUMMARY_CHANGED = 'GAME_SUMMARY_CHANGED'
export const gameSummaryChanged = (gameId, summary) => ({ type: GAME_SUMMARY_CHANGED, gameId, summary })
