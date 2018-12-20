import { withFilter } from 'graphql-subscriptions'

const SIGNAL_TOPIC = 'signal'

export function signal (parent, { input }, { pubsub }, info) {
  pubsub.publish(SIGNAL_TOPIC, input)
  return true
}

export const signals = {
  resolve: signal => signal,
  subscribe: withFilter(
    (obj, args, { pubsub }) => pubsub.asyncIterator(SIGNAL_TOPIC),
    (signal, { roomId, userId }) => signal.roomId === roomId && signal.userId !== userId
  )
}
