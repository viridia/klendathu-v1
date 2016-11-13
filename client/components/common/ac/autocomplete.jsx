import React, { PropTypes } from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import classNames from 'classnames';
import './autocompleteChips.scss';

export default class AutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onReceiveSuggestions = this.onReceiveSuggestions.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClickSuggestion = this.onClickSuggestion.bind(this);
    this.state = {
      open: false,
      valid: false,
      focused: false,
      suggestions: [],
      suggestionIndex: -1,
    };
    this.suggestionMap = new Map();
    this.searchValue = null;
    this.timer = null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.menu && !prevState.open && this.state.open) {
      this.menu.scrollIntoView(false);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onValueChange(e) {
    const value = e.target.value;
    this.props.onChange(value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (value !== this.searchValue) {
        this.searchValue = this.props.value;
        this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
      }
    }, 30);
  }

  onFocus() {
    this.setState({ focused: true });
  }

  onBlur() {
    // Wait until we've had a chance to process click events before obliterating the menu dom.
    setTimeout(() => {
      this.setState({ focused: false, open: false });
    }, 1);
  }

  onClickSuggestion(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.searchValue = '';
    this.chooseSuggestion(item);
  }

  onReceiveSuggestions(suggestions) {
    this.setState({
      suggestions,
      open: suggestions.length > 0,
      suggestionIndex: suggestions.indexOf(this.props.value),
    });
    if (this.props.value !== this.searchValue) {
      this.searchValue = this.props.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  onKeyDown(e) {
    const { suggestions, suggestionIndex } = this.state;
    const suggestionCount = suggestions.length;
    switch (e.keyCode) {
      case 40: // DOWN
        if (suggestionCount > 0) {
          e.preventDefault();
          e.stopPropagation();
          let index = suggestionIndex + 1;
          if (index >= suggestionCount) {
            index = 0;
          }
          this.setState({
            suggestionIndex: index,
            open: true,
          });
        }
        break;
      case 38: // UP
        if (suggestionCount > 0 && this.state.open) {
          e.preventDefault();
          e.stopPropagation();
          let index = suggestionIndex - 1;
          if (index < 0) {
            index = -1;
          }
          this.setState({ suggestionIndex: index });
        }
        break;
      case 13: // RETURN
        e.preventDefault();
        e.stopPropagation();
        if (suggestionCount > 0 && suggestionIndex !== -1) {
          if (!this.state.open) {
            if (this.props.onEnter) {
              this.props.onEnter();
            }
          } else {
            const item = suggestions[suggestionIndex];
            this.setState({
              value: '',
              open: false,
            });
            this.searchValue = '';
            this.chooseSuggestion(item);
            if (this.props.onEnter) {
              this.props.onEnter();
            }
          }
        } else if (this.props.onEnter) {
          this.props.onEnter();
        }
        break;
      case 27: // ESC
        if (this.state.open) {
          this.setState({ open: false });
        }
        break;
      case 9: // TAB
      default:
        break;
    }
  }

  chooseSuggestion(suggestion) {
    if (!suggestion) {
      throw new Error('Invalid suggestion.');
    }
    const value = this.props.onGetValue(suggestion);
    this.setState({ value, open: false });
    this.props.onChange(value);
  }

  renderSuggestions() {
    const { onGetValue, onRenderSuggestion } = this.props;
    const { suggestions, suggestionIndex } = this.state;
    const menu = suggestions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === suggestionIndex;
      return (<li
          className={classNames({ active })}
          key={value}
          role="presentation">
        <a
            role="menuitem"
            tabIndex="-1"
            href=""
            data-index={index}
            onClick={e => { this.onClickSuggestion(e, s); }}>
          {onRenderSuggestion(s)}
        </a>
      </li>);
    });
    return menu;
  }

  render() {
    const { value, className, maxLength, placeholder, autoFocus } = this.props;
    const { valid, open, focused } = this.state;
    const editing = value.length > 0;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid, open, focused, editing })}>
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={value.length > 0 ? null : placeholder}
            ref={el => { this.input = el; }}
            autoFocus={autoFocus}
            value={value}
            maxLength={maxLength}
            onChange={this.onValueChange}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur} />
        <ul
            role="menu"
            ref={el => { this.menu = el; }}
            className="ac-menu dropdown-menu"
            aria-labelledby="labels">
          {this.renderSuggestions()}
        </ul>
      </div>
    );
  }
}

AutoComplete.propTypes = {
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  onSearch: PropTypes.func.isRequired,
  onChooseSuggestion: PropTypes.func,
  onRenderSuggestion: PropTypes.func,
  onGetValue: PropTypes.func,
  onEnter: PropTypes.func,
  onChange: PropTypes.func.isRequired,
};

AutoComplete.defaultProps = {
  onChooseSuggestion: () => false,
  onRenderSuggestion: (suggestion) => suggestion,
  onGetValue: (suggestion) => suggestion,
};
