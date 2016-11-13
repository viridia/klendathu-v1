import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import AutoComplete from '../common/ac/autocomplete.jsx';
import SearchCustomFieldsQuery from '../../graphql/queries/searchCustomFields.graphql';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

class CustomSuggestField extends React.Component {
  constructor() {
    super();
    this.onSearch = this.onSearch.bind(this);
    this.onRenderSuggestion = this.onRenderSuggestion.bind(this);
    this.onGetValue = this.onGetValue.bind(this);
    this.onGetSortKey = this.onGetSortKey.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onSearch(search, callback) {
    if (search.length < 1) {
      callback([]);
    } else {
      const terms = search.split(/\s+/);
      this.reList = terms.map(term => new RegExp(`(^|\\s)${escapeRegExp(term)}`, 'i'));
      this.props.client.query({
        query: SearchCustomFieldsQuery,
        variables: {
          search,
          field: this.props.field.id,
          project: this.props.project.id,
        },
      }).then(resp => {
        callback(resp.data.searchCustomFields);
      });
    }
  }

  onRenderSuggestion(text) {
    const tlist = [text];
    for (const re of this.reList) {
      for (let i = 0; i < tlist.length; i += 2) {
        const split = this.highlightMatches(re, tlist[i]);
        if (split !== null) {
          tlist.splice(i, 1, ...split);
          break;
        }
      }
    }
    const parts = [];
    tlist.forEach((tx, i) => {
      if (i % 2) {
        parts.push(<strong key={i}>{tx}</strong>);
      } else if (tx.length > 0) {
        parts.push(<span key={i}>{tx}</span>);
      }
    });
    return <span className="suggestion">{parts}</span>;
  }

  onGetValue(text) {
    return text;
  }

  onGetSortKey(text) {
    return text;
  }

  onChangeValue(value) {
    this.props.onChange(this.props.field.id, value);
  }

  highlightMatches(re, str) {
    const m = str.match(re);
    if (m) {
      const mtext = m[0];
      return [
        str.slice(0, m.index),
        mtext,
        str.slice(m.index + mtext.length),
      ];
    }
    return null;
  }

  render() {
    const { field, value } = this.props;
    return (
      <AutoComplete
          className="keywords ac-multi"
          allowNew
          value={value}
          maxLength={field.max_length}
          onSearch={this.onSearch}
          onEnter={this.props.onEnter}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onChange={this.onChangeValue} />
    );
  }
}

CustomSuggestField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    default: PropTypes.string,
    max_length: PropTypes.number,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
  value: React.PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onEnter: PropTypes.func,
};

export default withApollo(CustomSuggestField);
