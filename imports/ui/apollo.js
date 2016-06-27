import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

const networkInterface = createNetworkInterface('/graphql');

export const client = new ApolloClient({
  networkInterface,
});

function loginToken(previousState = null, action) {
  if (action.type === 'SET_LOGIN_TOKEN') {
    return action.loginToken;
  }

  return previousState;
}

function paging(previousState = { page: 1 }, action) {
  if (action.type === 'SET_PAGE') {
    return Object.assign({}, previousState, {
      page: action.page
    });
  }

  return previousState;
}

const currentStateString = localStorage.getItem("reduxState");
const currentState = currentStateString ? JSON.parse(currentStateString) : {};

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    loginToken,
    paging
  }),
  currentState,
  compose(
    applyMiddleware(client.middleware()),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

store.subscribe(() => {
  localStorage.setItem("reduxState", JSON.stringify(store.getState()));
})

networkInterface.use([{
  applyMiddleware(request, next) {
    const currentUserToken = store.getState().loginToken;

    if (!currentUserToken) {
      next();
      return;
    }

    if (!request.options.headers) {
      request.options.headers = new Headers();
    }

    request.options.headers.Authorization = currentUserToken;

    next();
  }
}]);
