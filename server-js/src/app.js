import express from 'express'
import { graphqlExpress } from 'apollo-server-express'
import morgan from 'morgan'
import schema from './schema'
import expressPlayground from 'graphql-playground-middleware-express'

const app = express()
app.use(morgan('combined'))

const rooms = {}

app.get('/graphql/playground', expressPlayground({ endpoint: 'graphql' }), (req, res) => { })
app.use('/graphql', express.json(), graphqlExpress(req => ({ schema, context: { rooms } })))

app.listen(3000, () => console.log('running graphql server on port 3000'))
