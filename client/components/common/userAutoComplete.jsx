import React from 'react';
import Autosuggest, { ItemAdapter } from 'react-bootstrap-autosuggest';
import axios from 'axios';
import 'react-bootstrap-autosuggest/src/Autosuggest.scss';
import './userAutoComplete.scss';

class UserAdapter extends ItemAdapter {
  getTextRepresentations(item) {
    return item.username;
  }
  renderItem(item) {
    return (<div className="user">
      {item.username} ({item.fullname})
    </div>);
  }
}
UserAdapter.instance = new UserAdapter();

export default class UserAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.state = {
      datalist: [],
    };
  }

  onSearch(token) {
    if (token.length < 2) {
      this.setState({ datalist: [] });
      return;
    }
    axios.get('user', { params: { project: this.props.project.name, token } }).then(resp => {
      this.setState({ datalist: resp.data.users.map(u => ({
        ...u,
        label: `${u.username} (${u.fullname})`,
      })) });
    });
  }

  render() {
    const { className, placeholder, multiple, onSelect } = this.props;
    return (
      <Autosuggest
          groupClassName={className}
          placeholder={placeholder}
          datalist={this.state.datalist}
          datalistOnly
          datalistPartial
          multiple={multiple}
          onSearch={this.onSearch}
          showToggle
          itemReactKeyPropName="username"
          itemSortKeyPropName="username"
          itemValuePropName="username"
          itemAdapter={UserAdapter.instance}
          onSelect={onSelect} />
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
};
