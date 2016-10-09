import React from 'react';
import axios from 'axios';
import AutoCompleteChips from './ac/autocompleteChips.jsx';
import Chip from './ac/chip.jsx';

export default class UserAutoComplete extends React.Component {
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
      axios.get('user', { params: { project: this.props.project.name, token } }).then(resp => {
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
  value: React.PropTypes.string,
  className: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  project: React.PropTypes.shape({
    name: React.PropTypes.string,
  }),
  multiple: React.PropTypes.bool,
  onSelect: React.PropTypes.func,
  onFocusNext: React.PropTypes.func,
};
