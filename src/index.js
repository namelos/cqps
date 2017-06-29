import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, createNetworkInterface, ApolloProvider, graphql, gql } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

const wsClient = new SubscriptionClient(`ws://localhost:3000/api/subscriptions`, {
  reconnect: true
})

const networkInterface = createNetworkInterface({ uri: '/api/graphql' })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

const client = new ApolloClient({ networkInterface: networkInterfaceWithSubscriptions })

const MyQuery = gql`
query {
  hello
}
`

const MySubscription = gql`
subscription {
  counter
}
`

const Hello = graphql(MyQuery)(
  class extends React.Component {
    state = {n: 2}
    componentWillMount() {
      this.props.data.subscribeToMore({
        document: MySubscription,
        updateQuery: (prev, {subscriptionData}) => {
          this.setState({n: subscriptionData.data.counter})
        }
      })
    }
    render() {
      return <div>
        <div>{this.state.n}</div>
          <div>{this.props.data.hello}</div>
        </div>
    }
  }
  // ({data}) => {
  // return <div>
  //   {data.hello}
  // </div>;
  // }
)

const App = () =>
  <ApolloProvider client={client}>
    <Hello />
  </ApolloProvider>

ReactDOM.render(<App />, document.getElementById('root'));
