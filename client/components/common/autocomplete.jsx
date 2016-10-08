import React from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import classNames from 'classnames';
import './autocomplete.scss';

class AcInput extends React.Component {
  // module.exports = {
  //   BACKSPACE: 8,
  //   TAB: 9,
  //   RETURN: 13,
  //   ESC: 27,
  //   SPACE: 32,
  //   LEFT: 37,
  //   UP: 38,
  //   RIGHT: 39,
  //   DOWN: 40,
  // };

  render() {
    const { className, maxLength, value, ref, onChange, onKeyDown } = this.props;
    return (
      <FormControl
          type="text"
          className={className}
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          onKeyDown={onKeyDown} />
    );
  }
}

AcInput.propTypes = {
  className: React.PropTypes.string,
  maxLength: React.PropTypes.number,
  // onClick: React.PropTypes.func.isRequired,
  value: React.PropTypes.string.isRequired,
  ref: React.PropTypes.func,
  onChange: React.PropTypes.func.isRequired,
  onKeyDown: React.PropTypes.func.isRequired,
};

export default class AutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.onReceiveSuggestions = this.onReceiveSuggestions.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      open: false,
      valid: false,
      suggestions: [],
      value: '',
    };
    this.searchValue = null;
    this.timer = null;
  }

  // componentWillUpdate(nextProps, nextState) {
  //   if (this.state.value !== nextState.value) {
  //     clearTimeout(this.timer);
  //     this.timer = setTimeout(() => {
  //       this.props.onSearch(nextState.value, this.onReceiveSuggestions);
  //     }, 30);
  //   }
  // }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onValueChange(e) {
    const previ = this.state.value;
    const value = e.target.value;
    if (previ !== value) {
      this.setState({ value });
      if (value !== this.searchValue) {
        this.searchValue = value;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.props.onSearch(value, this.onReceiveSuggestions);
        }, 30);
      }
    }
    // this.setState({
    //   value: value,
    //   open: e.target.value.length > 1,
    // });
  }

  onReceiveSuggestions(suggestions) {
    this.setState({ suggestions, open: suggestions.length > 0 });
    if (this.state.value !== this.searchValue) {
      this.props.onSearch(this.state.value, this.onReceiveSuggestions);
    }
  }

  onToggle(open) {
    this.setState({ open });
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 40: // DOWN
        if (this.state.suggestions.length > 0) {
          e.preventDefault();
          // console.log(this.dropdown);
          this.dropdown.focusNext();
        }
        break;
      default:
        break;
    }
  }

  renderSuggestions() {
    const cb = this.props.onRenderSuggestion;
    return this.state.suggestions.map(s => cb(s));
  }

  render() {
    const { id } = this.props;
    return (
      <Dropdown
          className={classNames('autocomplete', { valid: this.state.valid })}
          id={id}
          open={this.state.open}
          onToggle={this.onToggle}>
        {/* <div className="hint">hint</div> */}
        <AcInput
            {...this.props}
            value={this.state.value}
            onChange={this.onValueChange}
            onKeyDown={this.onKeyDown}
            bsRole="toggle" />
        <Dropdown.Menu
            ref={el => { this.dropdown = el; }}
            className="ac-menu"
            bsRole="menu">
          {this.renderSuggestions()}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

AutoComplete.propTypes = {
  id: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  onSearch: React.PropTypes.func.isRequired,
  onRenderSuggestion: React.PropTypes.func,
};

AutoComplete.defaultProps = {
  onRenderSuggestion: suggestion =>
    <MenuItem key={suggestion} eventKey={suggestion}>{suggestion}</MenuItem>,
};
