import React from 'react';
import axios from 'axios';
import AutoComplete from './autocomplete.jsx';

export default class UserAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.onRenderSuggestion = this.onRenderSuggestion.bind(this);
    this.state = {
      datalist: [],
    };
  }

  onSearch(token, callback) {
    if (token.length < 2) {
      this.setState({ datalist: [] });
      return;
    }
    axios.get('user', { params: { project: this.props.project.name, token } }).then(resp => {
      callback(resp.data.users);
    });
  }

  onRenderSuggestion(user) {
    return user.fullname;
  }

  render() {
    return (
      <AutoComplete
          {...this.props}
          onSearch={this.onSearch}
          onRenderSuggestion={this.onRenderSuggestion} />
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
