import React from 'react'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import JoinRoom from './JoinRoom'
import Room from './Room'

export default function Router () {
  return (
    <BrowserRouter>
      <div className="Router">
        <nav>
          <ul>
            <li>
              <Link to="/">Join Room</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/" exact component={JoinRoom} />
          <Route path="/r/:id" exact component={Room} />
        </Switch>
      </div>
    </BrowserRouter>
  )
}
