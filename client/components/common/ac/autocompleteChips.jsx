import React, { PropTypes } from 'react';
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
    this.onClickSuggestion = this.onClickSuggestion.bind(this);
    this.state = {
      open: false,
      valid: false,
      focused: false,
      suggestions: [],
      suggestionsSuffix: [],
      suggestionIndex: -1,
      value: '',
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
    let value = e.target.value;
    // Don't allow typing if it's a non-multiple and we already have a value.
    if (!this.props.multiple && this.selection().length > 0) {
      value = '';
    }
    this.setState({ value });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (value !== this.searchValue) {
        this.searchValue = value;
        this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
      }
    }, 30);
  }

  onFocus() {
    this.setState({ focused: true });
    if (this.state.value.length === 0) {
      this.searchValue = this.state.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  onBlur() {
    this.setState({ focused: false, open: false });
  }

  onClickContainer(e) {
    e.preventDefault();
    const inputEl = ReactDOM.findDOMNode(this.input); // eslint-disable-line
    inputEl.focus();
  }

  onClickSuggestion(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      value: '',
      open: false,
    });
    this.searchValue = '';
    this.chooseSuggestion(item);
  }

  onReceiveSuggestions(suggestions, suggestionsSuffix = []) {
    const alreadySelected = new Set(this.selection().map(s => this.props.onGetValue(s)));
    const uniqueSuggestions =
      suggestions.filter(s => !alreadySelected.has(this.props.onGetValue(s)));
    const suggestionCount = uniqueSuggestions.length + suggestionsSuffix.length;
    this.setState({
      suggestions: uniqueSuggestions,
      suggestionsSuffix,
      open: suggestionCount > 0,
      suggestionIndex: uniqueSuggestions.length > 0 ? 0 : -1,
    });
    if (this.state.value !== this.searchValue) {
      this.searchValue = this.state.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  onKeyDown(e) {
    const { suggestions, suggestionsSuffix, suggestionIndex } = this.state;
    const suggestionCount = suggestions.length + suggestionsSuffix.length;
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
            const item = suggestions.concat(suggestionsSuffix)[suggestionIndex];
            this.setState({
              value: '',
              open: false,
            });
            this.searchValue = '';
            this.chooseSuggestion(item);
          }
        } else if (this.props.onEnter) {
          this.props.onEnter();
        }
        break;
      case 8: // BACKSPACE
        {
          // Remove the last chip from the selection.
          const inputEl = ReactDOM.findDOMNode(this.input); // eslint-disable-line
          if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
            this.deleteLastSelectedItem();
          }
        }
        break;
      case 9: // TAB
      case 27: // ESC
      default:
        break;
    }
  }

  deleteLastSelectedItem() {
    if (this.selection().length > 0) {
      this.updateSelection(this.selection().slice(0, -1));
    }
  }

  chooseSuggestion(suggestion) {
    if (!suggestion) {
      throw new Error('Invalid suggestion.');
    }
    const callback = s => { this.addToSelection(s); };
    const done = this.props.onChooseSuggestion(suggestion, callback);
    if (!done) {
      this.addToSelection(suggestion);
    }
  }

  addToSelection(item) {
    let selection = this.selection();
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
    this.updateSelection(selection);
  }

  updateSelection(selection) {
    if (this.props.multiple) {
      this.props.onSelectionChange(selection);
    } else if (selection.length > 0) {
      this.props.onSelectionChange(selection[0]);
    } else {
      this.props.onSelectionChange(null);
    }
  }

  selection() {
    if (Array.isArray(this.props.selection)) {
      return this.props.selection;
    } else if (this.props.selection === null || this.props.selection === undefined) {
      return [];
    } else {
      return [this.props.selection];
    }
  }

  renderSuggestions() {
    const { onGetValue, onRenderSuggestion } = this.props;
    const { suggestions, suggestionsSuffix, suggestionIndex } = this.state;
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
            onClick={e => this.onClickSuggestion(e, s)}>
          {onRenderSuggestion(s)}
        </a>
      </li>);
    });
    if (menu.length > 0 && suggestionsSuffix.length > 0) {
      menu.push(<hr key="-hr-" />);
    }
    const suffix = suggestionsSuffix.map((s, index) => {
      const value = onGetValue(s);
      const active = index === suggestionIndex - suggestions.length;
      return (<li
          className={classNames({ active })}
          key={value}
          role="presentation">
        <a
            role="menuitem"
            tabIndex="-1"
            href=""
            data-index={index}
            onClick={this.onClickSuggestion}>
          {onRenderSuggestion(s)}
        </a>
      </li>);
    });
    return menu.concat(suffix);
  }

  renderSelection() {
    const selection = this.selection();
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
    const { className, maxLength, placeholder, autoFocus } = this.props;
    const { value, valid, open, focused } = this.state;
    const selection = this.selection();
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

AutoCompleteChips.propTypes = {
  selection: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.any.isRequired),
    PropTypes.any,
  ]),
  className: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  multiple: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onChooseSuggestion: PropTypes.func,
  onRenderSuggestion: PropTypes.func,
  onRenderSelection: PropTypes.func,
  onGetValue: PropTypes.func,
  onGetSortKey: PropTypes.func,
  onEnter: PropTypes.func,
  onSelectionChange: PropTypes.func.isRequired,
};

AutoCompleteChips.defaultProps = {
  onChooseSuggestion: () => false,
  onRenderSuggestion: (suggestion) => suggestion,
  onGetValue: (suggestion) => suggestion,
  onGetSortKey: (suggestion) => suggestion.toLowerCase(),
};
