import { rooms, joinRoom, userJoined } from './room'

export default {
  Query: {
    rooms
  },
  Mutation: {
    joinRoom
  },
  Subscription: {
    userJoined
  }
}
