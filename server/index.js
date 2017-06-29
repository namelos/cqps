const { PubSub } = require('graphql-subscriptions')
const bodyParser = require('body-parser')
const { makeExecutableSchema } = require('graphql-tools')
const { graphqlExpress } = require('graphql-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { createServer } = require('http')
const { execute, subscribe } = require('graphql')

const COUNTER = 'COUNTER'

const pubsub = new PubSub()

const typeDefs = `
type Query {
  hello: String
}
type Subscription {
  counter: String
}
`

const resolvers = {
  Query: {
    hello: () => 'hello world'
  },
  Subscription: {
    counter: { subscribe: () => pubsub.asyncIterator(COUNTER) }
  }
}

const counter = (() => {
  let n = 0
  return () => n = n + 1
})()

setInterval(() => {
  const n = counter().toString()
  console.log(n)
  pubsub.publish(COUNTER, { counter: n })
}, 1000)

const schema = makeExecutableSchema({ typeDefs, resolvers })

const express = require('express')

const app = express()

app.use('/api/graphql', bodyParser.json(), graphqlExpress({ schema }))

const server = createServer(app)

server.listen(3001, () => {
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server,
    path: '/api/subscriptions'
  })
})

