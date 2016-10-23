import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import AutoCompleteChips from './ac/autocompleteChips.jsx';
import UsersQuery from '../../graphql/queries/users.graphql';
import Chip from './ac/chip.jsx';

class UserAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.onRenderSuggestion = this.onRenderSuggestion.bind(this);
    this.onRenderSelection = this.onRenderSelection.bind(this);
    this.onGetValue = this.onGetValue.bind(this);
    this.onGetSortKey = this.onGetSortKey.bind(this);
  }

  onSearch(token, callback) {
    if (token.length < 1) {
      callback([]);
    } else {
      this.props.client.query({
        query: UsersQuery,
        variables: { token, project: this.props.project.id },
      }).then(resp => {
        callback(resp.data.users);
      });
    }
  }

  onRenderSuggestion(user) {
    return (<span>
      <span className="name">{user.fullname}</span>
      &nbsp;- <span className="username">{user.username}</span>
    </span>);
  }

  onRenderSelection(user) {
    return (<Chip>
      <span className="name">{user.fullname}</span>
      &nbsp;- <span className="username">{user.username}</span>
    </Chip>);
  }

  onGetValue(user) {
    return user.username;
  }

  onGetSortKey(user) {
    return user.fullname;
  }

  render() {
    return (
      <AutoCompleteChips
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection} />
    );
  }
}

UserAutoComplete.propTypes = {
  value: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
  }),
  onFocusNext: PropTypes.func,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
  selection: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.any.isRequired),
    PropTypes.any,
  ]),
};

export default withApollo(UserAutoComplete);
