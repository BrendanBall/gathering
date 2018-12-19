import ApolloClient from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'

const wsClient = new SubscriptionClient('ws://localhost:3000/graphql', {
  reconnect: true
})

const client = new ApolloClient({
  link: new WebSocketLink(wsClient),
  cache: new InMemoryCache()
})

export default client
