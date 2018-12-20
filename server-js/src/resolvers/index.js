import { rooms, joinRoom, userJoined } from './room'
import { signal, signals } from './signal'

export default {
  Query: {
    rooms
  },
  Mutation: {
    joinRoom,
    signal
  },
  Subscription: {
    userJoined,
    signals
  }
}
