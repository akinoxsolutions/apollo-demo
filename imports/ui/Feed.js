import { connect } from 'react-apollo';
import _ from 'underscore';
import React from 'react';
import { browserHistory } from 'react-router';

import {
  Tabs,
  Tab,
  List,
  ListItem,
  AppBar,
  FlatButton,
  IconButton,
  RaisedButton,
  TextField,
  CircularProgress
} from 'material-ui';

const TopicListItem = ({ topic }) => (
  <ListItem
    primaryText={topic.title}
    onClick={() => {goToTopicPage(topic.id)}}
  />
);

const FeedPage = ({ page }) => (
  <List>
    { page.topics && page.topics.map((topic) => <TopicListItem topic={topic} />) }
  </List>
);

const Feed = ({ params, feed, loading, loginToken, page, dispatch, ...rest }) => {
  const needsLogin = !loginToken && _.includes(['new', 'unread'], params.type);
  console.log(dispatch, rest);

  return (
    <div>
      <Tabs
        onChange={handleRouteChange}
        value={params.type}
      >
        <Tab label="Latest" value={'latest'} />
        <Tab label="New" value={'new'} />
        <Tab label="Unread" value={'unread'} />
        <Tab label="Top" value={'top'} />
      </Tabs>
      { needsLogin && <div className="needs-login">Please log in to see this page.</div> }
      { feed.loading && <CircularProgress /> }
      { !feed.loading && !needsLogin &&
        feed.result.feed.pages.map((page) => <FeedPage page={page} />) }
        <button type="button" onClick={() => dispatch({ type: "SET_PAGE", page: page + 1 })}>more...</button>
    </div>
  );
}

const FeedWithData = connect({
  mapQueriesToProps({ ownProps, state }) {
    return {
      feed: {
        query: `
          query getFeed($type: FeedType!, $page: Int!) {
            feed(type: $type, page: $page) {
              pages {
                topics {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: {
          type: ownProps.params.type.toUpperCase(),
          page: state.paging.page
        }
      }
    }
  },
  mapStateToProps(state) {
    return {
      loginToken: state.loginToken,
      page: state.paging.page
    };
  },
})(Feed);

function handleRouteChange(value) {
  browserHistory.push(`/feed/${value}`);
}

function goToTopicPage(id) {
  browserHistory.push(`/topic/${id}`);
}

export default FeedWithData;
