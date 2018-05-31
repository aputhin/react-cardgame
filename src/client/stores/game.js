import {Observable, BehaviorSubject} from 'rxjs'
import {mapOp$} from 'shared/observable'
import * as A from '../actions'
import _ from 'lodash'

const defaultView = {
  id: 42,
  title: 'I haz game',
  step: A.STEP_SETUP,
  options: {
    scoreLimit: 5,
    sets: ['1ed']
  },
  players: [
    {id: 1, name: 'arthur', score: 6, isCzar: false, isPlaying: true, isWinner: false},
    {id: 2, name: 'carlos', score: 2, isCzar: false, isPlaying: false, isWinner: false},
    {id: 3, name: 'josué', score: 1, isCzar: false, isPlaying: false, isWinner: false},
    {id: 4, name: 'miguel', score: 4, isCzar: true, isPlaying: false, isWinner: false},
    {id: 5, name: 'cecília', score: 4, isCzar: false, isPlaying: false, isWinner: false}
  ],
  messages: [
    {index: 1, name: "tktktkt", message: "teste 123"},
    {index: 2, name: "tktktkt", message: "teste 123"},
    {index: 3, name: "tktktkt", message: "teste 123"},
    {index: 4, name: "tktktkt", message: "teste 123"}
  ],
  round: {
    blackCard: {
      id: 1,
      text: 'Thats where youre wrong',
      set: '1ed',
      whiteCardCount: 1
    },
    stacks: [
      {id: 1, cards: [{id: 1, text: 'hey1', set: 'lol4'}]},
      {id: 2, cards: [{id: 2, text: 'hey2', set: 'lol5'}]},
      {id: 3, cards: [{id: 3, text: 'hey3', set: 'lol6'}]},
    ]
  },
  timer: null
}

const defaultPlayerView = {
  id: 1,
  hand: [
      {id: 2, text: 'le card 2', set: '1ed'},
      {id: 3, text: 'le card 3', set: '1ed'},
      {id: 4, text: 'le card 4', set: '1ed'},
      {id: 6, text: 'le card 6', set: '1ed'}
  ],
  stack: {
    id: 2,
    cards: [
      {id: 5, text: 'le card 5', set: '1ed'},
    ]
  }
}

export default class GameStore {
  constructor({dispatcher}, user) {
    dispatcher.onRequest({
      [A.GAME_CREATE]: action => {
        dispatcher.succeed(action)
        dispatcher.succeed(A.gameJoin(42))
      },
      [A.GAME_JOIN]: action => dispatcher.succeed(action),
      [A.GAME_SET_OPTIONS]: action => dispatcher.succeed(action),
      [A.GAME_START]: action => dispatcher.succeed(action),
      [A.GAME_SELECT_CARD]: action => dispatcher.succeed(action),
      [A.GAME_SELECT_STACK]: action => dispatcher.succeed(action),
      [A.GAME_SEND_MESSAGE]: action => dispatcher.succeed(action)
    })

    this.view$ = new BehaviorSubject(defaultView)
    this.player$ = new BehaviorSubject(defaultPlayerView)

    const isLoggedIn$ = user.details$.map(d => d.isLoggedIn)

    this.opCreateGame$ = mapOp$(
      dispatcher.on$(A.GAME_CREATE),
      isLoggedIn$
    )

    this.opJoinGame$ = mapOp$(
      dispatcher.on$(A.GAME_JOIN)
    )

    this.opSetOptions$ = mapOp$(
      dispatcher.on$(A.GAME_SET_OPTIONS),
      isLoggedIn$
    )

    this.opStart$ = mapOp$(
      dispatcher.on$(A.GAME_START),
      isLoggedIn$
    )

    this.opStart$ = mapOp$(
      dispatcher.on$(A.GAME_START),
      isLoggedIn$
    )

    const playerAndGame$ = Observable.combineLatest(this.view$, this.player$)

    this.opSelectCard$ = mapOp$(
      dispatcher.on$(A.GAME_SELECT_CARD),
      playerAndGame$.map(([game, player]) => {
        const ourPlayer = _.find(game.players, {id: player.id})
        return ourPlayer && game.step === A.STEP_CHOOSE_WHITES && ourPlayer.isPlaying
      })
    )

    this.opSelectStack$ = mapOp$(
      dispatcher.on$(A.GAME_SELECT_STACK),
      playerAndGame$.map(([game, player]) => {
        const ourPlayer = _.find(game.players, {id: player.id})
        return ourPlayer && game.step === A.STEP_JUDGE_STACKS && ourPlayer.isCzar
      })
    )

    this.opSendMessage$ = mapOp$(
      dispatcher.on$(A.GAME_SEND_MESSAGE),
      isLoggedIn$
    )
  }
}