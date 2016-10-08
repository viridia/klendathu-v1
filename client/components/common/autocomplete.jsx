import React from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import classNames from 'classnames';
import './autocomplete.scss';

export default class AutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.onReceiveSuggestions = this.onReceiveSuggestions.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      open: false,
      valid: false,
      suggestions: [],
      value: '',
      selected: null,
      selectedValue: '',
      selectedIndex: -1,
    };
    this.suggestionMap = new Map();
    this.searchValue = null;
    this.timer = null;
  }

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
  }

  onReceiveSuggestions(suggestions) {
    this.setState({
      suggestions,
      open: suggestions.length > 0,
      selected: suggestions.length > 0 ? suggestions[0] : null,
      selectedIndex: suggestions.length > 0 ? 0 : -1,
    });
    if (this.state.value !== this.searchValue) {
      this.props.onSearch(this.state.value, this.onReceiveSuggestions);
    }
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 40: // DOWN
        if (this.state.suggestions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.state.selectedIndex + 1;
          if (index >= this.state.suggestions.length) {
            index = 0;
          }
          this.setState({
            selectedIndex: index,
            open: true,
          });
        }
        break;
      case 38: // UP
        if (this.state.suggestions.length > 0 && this.state.open) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.state.selectedIndex - 1;
          if (index < 0) {
            index = this.state.suggestions.length - 1;
          }
          this.setState({ selectedIndex: index });
        }
        break;
      case 13: // RETURN
        e.preventDefault();
        e.stopPropagation();
        if (this.state.suggestions.length > 0 && this.state.selectedIndex !== -1) {
          if (!this.state.open) {
            if (this.props.onFocusNext) {
              this.props.onFocusNext();
            }
          } else {
            this.setState({
              value: this.state.suggestions[this.state.selectedIndex],
              open: false,
            });
          }
        }
        break;
      case 9: // TAB
      case 27: // ESC
      default:
        break;
    }
  }

  renderSuggestions() {
    const { onGetValue, onRenderSuggestion } = this.props;
    return this.state.suggestions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === this.state.selectedIndex;
      return (<li
          className={classNames({ active })}
          key={value}
          role="presentation">
        <a role="menuitem" tabIndex="-1" href="">{onRenderSuggestion(s)}</a>
      </li>);
    });
  }

  render() {
    const { className, maxLength, placeholder } = this.props;
    const { value, valid, open } = this.state;
    return (
      <div className={classNames('autocomplete dropdown btn-group', { valid, open })}>
        {/* <div className="hint">hint</div> */}
        <FormControl
            type="text"
            className={className}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            onChange={this.onValueChange}
            onKeyDown={this.onKeyDown} />
        <ul
            role="menu"
            className="ac-menu dropdown-menu"
            aria-labelledby="labels">
          {this.renderSuggestions()}
        </ul>
      </div>
    );
  }
}

AutoComplete.propTypes = {
  className: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  maxLength: React.PropTypes.number,
  onSearch: React.PropTypes.func.isRequired,
  onRenderSuggestion: React.PropTypes.func,
  onGetValue: React.PropTypes.func,
  onFocusNext: React.PropTypes.func,
};

AutoComplete.defaultProps = {
  onRenderSuggestion: (suggestion) => suggestion,
  onGetValue: (suggestion) => suggestion,
};
