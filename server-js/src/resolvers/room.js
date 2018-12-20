import { withFilter } from 'graphql-subscriptions'

const USER_JOINED_TOPIC = 'user_joined'

export function rooms (parent, args, { rooms }, info) {
  return roomsToGraphql(rooms)
}

export function joinRoom (parent, { roomId, userId }, { rooms, pubsub }, info) {
  if (!rooms[roomId]) {
    rooms[roomId] = { id: roomId, users: {} }
  }
  rooms[roomId].users[userId] = { id: userId }
  pubsub.publish(USER_JOINED_TOPIC, roomToGraphql(rooms[roomId]))
  return roomToGraphql(rooms[roomId])
}

function roomToGraphql ({ id, users }) {
  return { id, users: Object.values(users) }
}

function roomsToGraphql (rooms) {
  return Object.values(rooms).map(roomToGraphql)
}

export const userJoined = {
  resolve: room => room,
  subscribe: withFilter(
    (obj, args, { pubsub }) => pubsub.asyncIterator(USER_JOINED_TOPIC),
    (room, { roomId }) => room.id === roomId
  )
}
