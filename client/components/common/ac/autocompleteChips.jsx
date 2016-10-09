import React from 'react';
import ReactDOM from 'react-dom';
import FormControl from 'react-bootstrap/lib/FormControl';
import classNames from 'classnames';
import './autocompleteChips.scss';

export default class AutoCompleteChips extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onReceiveSuggestions = this.onReceiveSuggestions.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClickContainer = this.onClickContainer.bind(this);
    this.state = {
      open: false,
      valid: false,
      focused: false,
      suggestions: [],
      suggestionIndex: -1,
      value: '',
      selection: [],
    };
    this.suggestionMap = new Map();
    this.searchValue = null;
    this.timer = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onValueChange(e) {
    let value = e.target.value;
    // Don't allow typing if it's a non-multiple and we already have a value.
    if (!this.props.multiple && this.state.selection.length > 0) {
      value = '';
    }
    this.setState({ value });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (value !== this.searchValue) {
        this.searchValue = this.state.value;
        this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
      }
    }, 30);
  }

  onFocus() {
    this.setState({ focused: true });
  }

  onBlur() {
    this.setState({ focused: false });
  }

  onClickContainer(e) {
    e.preventDefault();
    const inputEl = ReactDOM.findDOMNode(this.input); // eslint-disable-line
    inputEl.focus();
  }

  onReceiveSuggestions(suggestions) {
    this.setState({
      suggestions,
      open: suggestions.length > 0,
      suggestionIndex: suggestions.length > 0 ? 0 : -1,
    });
    if (this.state.value !== this.searchValue) {
      this.searchValue = this.this.value;
      this.props.onSearch(this.state.value, this.onReceiveSuggestions);
    }
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 40: // DOWN
        if (this.state.suggestions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.state.suggestionIndex + 1;
          if (index >= this.state.suggestions.length) {
            index = 0;
          }
          this.setState({
            suggestionIndex: index,
            open: true,
          });
        }
        break;
      case 38: // UP
        if (this.state.suggestions.length > 0 && this.state.open) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.state.suggestionIndex - 1;
          if (index < 0) {
            index = this.state.suggestions.length - 1;
          }
          this.setState({ suggestionIndex: index });
        }
        break;
      case 13: // RETURN
        e.preventDefault();
        e.stopPropagation();
        if (this.state.suggestions.length > 0 && this.state.suggestionIndex !== -1) {
          if (!this.state.open) {
            if (this.props.onFocusNext) {
              this.props.onFocusNext();
            }
          } else {
            const item = this.state.suggestions[this.state.suggestionIndex];
            this.setState({
              value: '',
              open: false,
            });
            this.searchValue = '';
            this.addToSelection(item);
          }
        }
        break;
      case 8: // BACKSPACE
        {
          // Remove the last chip from the selection.
          const inputEl = ReactDOM.findDOMNode(this.input); // eslint-disable-line
          if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
            this.setState({ selection: this.state.selection.slice(0, -1) });
          }
        }
        break;
      case 9: // TAB
      case 27: // ESC
      default:
        break;
    }
  }

  addToSelection(item) {
    let selection = this.state.selection;
    for (let i = 0; i < selection.length; i += 1) {
      // Value is already in the list.
      if (this.props.onGetValue(item) === this.props.onGetValue(selection[i])) {
        return;
      }
    }
    selection = selection.concat([item]);
    selection.sort((a, b) => {
      const aKey = this.props.onGetSortKey(a);
      const bKey = this.props.onGetSortKey(b);
      if (aKey < bKey) { return -1; }
      if (aKey < bKey) { return 1; }
      return 0;
    });
    this.setState({ selection });
  }

  renderSuggestions() {
    const { onGetValue, onRenderSuggestion } = this.props;
    return this.state.suggestions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === this.state.suggestionIndex;
      return (<li
          className={classNames({ active })}
          key={value}
          role="presentation">
        <a role="menuitem" tabIndex="-1" href="">{onRenderSuggestion(s)}</a>
      </li>);
    });
  }

  renderSelection() {
    const { selection } = this.state;
    const result = [];
    for (let i = 0; i < selection.length; i += 1) {
      const item = selection[i];
      const value = this.props.onGetValue(item);
      const last = (i === selection.length - 1) && this.state.value.length === 0;
      const chip = this.props.onRenderSelection(item);
      result.push(
        <span className={classNames('ac-chip-wrapper', { last })} key={value}>
          {chip}
        </span>
      );
    }
    return result;
  }

  render() {
    const { className, maxLength, placeholder } = this.props;
    const { value, valid, open, selection, focused } = this.state;
    const editing = value.length > 0;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid, open, focused, editing })}
          onMouseDown={this.onClickContainer}>
        {this.renderSelection()}
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={selection.length > 0 ? null : placeholder}
            ref={el => { this.input = el; }}
            value={value}
            maxLength={maxLength}
            onChange={this.onValueChange}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur} />
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

AutoCompleteChips.propTypes = {
  className: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  maxLength: React.PropTypes.number,
  multiple: React.PropTypes.bool,
  onSearch: React.PropTypes.func.isRequired,
  onRenderSuggestion: React.PropTypes.func,
  onRenderSelection: React.PropTypes.func,
  onGetValue: React.PropTypes.func,
  onGetSortKey: React.PropTypes.func,
  onFocusNext: React.PropTypes.func,
};

AutoCompleteChips.defaultProps = {
  onRenderSuggestion: (suggestion) => suggestion,
  onGetValue: (suggestion) => suggestion,
  onGetSortKey: (suggestion) => suggestion.toLowerCase(),
};
