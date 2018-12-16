export function rooms (parent, args, { rooms }, info) {
  return roomsToGraphql(rooms)
}

export function createRoom (parent, { input: { id, name } }, { rooms }, info) {
  rooms[id] = { id, name, users: { } }
  return rooms[id]
}

export function joinRoom (parent, { id, user }, { rooms }, info) {
  let room = rooms[id]
  room.users[user.id] = user
  return roomToGraphql(room)
}

function roomToGraphql ({ id, name, users }) {
  return { id, name, users: Object.values(users) }
}

function roomsToGraphql (rooms) {
  return Object.values(rooms).map(roomToGraphql)
}
