import express from 'express'
import { createServer } from 'http'
import { graphqlExpress } from 'apollo-server-express'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import morgan from 'morgan'
import schema from './schema'
import expressPlayground from 'graphql-playground-middleware-express'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

const app = express()
app.use(morgan('combined'))

const rooms = {}
const PORT = 3000

app.get('/graphql/playground', expressPlayground({
  endpoint: 'graphql',
  subscriptionEndpoint: `ws://localhost:${PORT}/graphql`
}), (req, res) => { })
app.use('/graphql', express.json(), graphqlExpress(req => ({ schema, context: { rooms, pubsub } })))

// app.listen(PORT, () => console.log(`running graphql server on port ${PORT}`))

function onOperation (message, params, webSocket) {
  return { ...params, context: { pubsub, rooms } }
}

const websocketServer = createServer(app)
websocketServer.listen(PORT, () => {
  return SubscriptionServer.create({ schema, execute, subscribe, onOperation }, { server: websocketServer })
})
