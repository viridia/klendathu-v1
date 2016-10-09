import React from 'react';
import ReactDOM from 'react-dom';
import FormControl from 'react-bootstrap/lib/FormControl';
import classNames from 'classnames';
import CloseIcon from 'icons/ic_close_black_24px.svg';
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
    const value = e.target.value;
    this.setState({ value });
    if (value !== this.searchValue) {
      this.searchValue = value;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.props.onSearch(value, this.onReceiveSuggestions);
      }, 30);
    }
  }

  onReceiveSuggestions(suggestions) {
    this.setState({
      suggestions,
      open: suggestions.length > 0,
      suggestionIndex: suggestions.length > 0 ? 0 : -1,
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
      const last = i === selection.length - 1;
      result.push(
        <span className={classNames('ac-chip-wrapper', { last })} key={value}>
          <span className="ac-chip">
            <CloseIcon />
            <span className="title">{this.props.onRenderSuggestion(item)}</span>
          </span>
        </span>
      );
    }
    return result;
  }

  render() {
    const { className, maxLength, placeholder } = this.props;
    const { value, valid, open } = this.state;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid, open })}>
        {this.renderSelection()}
        {/* <div className="hint">hint</div> */}
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={placeholder}
            ref={el => { this.input = el; }}
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
  multiple: React.PropTypes.bool,
  onSearch: React.PropTypes.func.isRequired,
  onRenderSuggestion: React.PropTypes.func,
  onGetValue: React.PropTypes.func,
  onGetSortKey: React.PropTypes.func,
  onFocusNext: React.PropTypes.func,
};

AutoComplete.defaultProps = {
  onRenderSuggestion: (suggestion) => suggestion,
  onGetValue: (suggestion) => suggestion,
  onGetSortKey: (suggestion) => suggestion.toLowerCase(),
};
