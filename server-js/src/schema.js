import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.gql'
import resolvers from './resolvers'

export default makeExecutableSchema({
  typeDefs,
  resolvers
})
