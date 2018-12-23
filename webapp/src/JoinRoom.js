import React, { useState, useContext } from 'react'
import useReactRouter from 'use-react-router'
import gql from 'graphql-tag'
import client from './graphql'
import { UserContext } from './context'

const joinRoomQuery = gql`mutation JoinRoom($roomId: ID!, $userId: ID!) {
  joinRoom(roomId: $roomId, userId: $userId) {
    id
    users {
      id
    }
  }
}`

export default function JoinRoom () {
  const [roomId, setRoomId] = useState('')
  const { userId } = useContext(UserContext)
  const { history } = useReactRouter()
  const joinRoom = (event) => {
    event.preventDefault()
    client.mutate({
      mutation: joinRoomQuery,
      variables: { roomId, userId }
    })
      .then(() => history.push(`/r/${roomId}`))
  }

  return (
    <div className="JoinRoom">
      <h1>Join A Room</h1>
      <UserContext.Consumer>
        {({ userId, setUser }) => (
          <form onSubmit={joinRoom}>
            <label>
            Room
              <input type="text" value={roomId} onChange={event => setRoomId(event.target.value)} />
              <input type="text" value={userId || ''} onChange={event => setUser(event.target.value)} />
            </label>
            <input type="submit" value="Join" />
          </form>
        )}
      </UserContext.Consumer>
    </div>
  )
}
