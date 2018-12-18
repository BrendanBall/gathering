import React, { useState } from 'react'
import useReactRouter from 'use-react-router'

export default function JoinRoom () {
  const [roomId, setRoomId] = useState('')
  const { history } = useReactRouter()
  const joinRoom = () => history.push(`/r/${roomId}`)
  return (
    <div className="JoinRoom">
      <h1>Join A Room</h1>
      <form onSubmit={joinRoom}>
        <label>
        Room
          <input type="text" value={roomId} onChange={event => setRoomId(event.target.value)} />
        </label>
        <input type="submit" value="Join" />
      </form>
    </div>
  )
}
