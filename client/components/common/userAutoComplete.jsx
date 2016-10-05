import React from 'react';
import Typeahead from 'react-bootstrap-typeahead';
import axios from 'axios';

export default class UserAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.state = {
      token: '',
      options: [],
    };
    this.timer = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onChange(matches) {
    this.props.onChange(matches.length === 1 ? matches[0] : null);
  }

  onInputChange(text) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const token = text.trim();
      if (token === '') {
        this.setState({ options: [] });
        return;
      }
      axios.get('user', { params: { project: this.props.project.name, token } }).then(resp => {
        const options = resp.data.users.map(user => ({
          id: user.username,
          label: user.username,
          fullname: user.fullname,
        }));
        // 'me' is an alias for the current user.
        // if (token === 'me') {
        //   options.push({ id: 'me', label: 'me', fullname: '' });
        // }
        this.setState({ options });
      });
    }, 20);
  }

  render() {
    const { className, placeholder, defaultSelected } = this.props;
    const defaultEntry = defaultSelected ? [defaultSelected] : [];
    return (
      <Typeahead
          className={className}
          options={this.state.options}
          placeholder={placeholder}
          defaultSelected={defaultEntry}
          onInputChange={this.onInputChange}
          onChange={this.onChange}
          renderMenuItemChildren={(props, option, idx) => {
            console.log(props, option, idx);
            return (<span>
              {option.label}
              {option.fullname && <span> (<em>{option.fullname}</em>)</span>}
            </span>);
          }} />
    );
  }
}

UserAutoComplete.propTypes = {
  defaultSelected: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
  }),
  className: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  project: React.PropTypes.shape({
    name: React.PropTypes.string,
  }),
  onChange: React.PropTypes.func,
};
