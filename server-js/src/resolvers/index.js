import { rooms, createRoom, joinRoom } from './room'

export default {
  Query: {
    rooms
  },
  Mutation: {
    createRoom,
    joinRoom
  }
}
