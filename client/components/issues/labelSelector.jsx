import React, { PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import AutocompleteChips from '../common/ac/autocompleteChips.jsx';
import LabelDialog from './labelDialog.jsx';
import Chip from '../common/ac/chip.jsx';
import './labelSelector.scss';
import '../common/ac/chip.scss';

const LabelQuery = gql`query LabelQuery($token:String!) {
  labels(token: $token) {
    id
    name
    color
  }
}`;

class LabelSelector extends React.Component {
  constructor() {
    super();
    this.onSearchLabels = this.onSearchLabels.bind(this);
    this.onChooseSuggestion = this.onChooseSuggestion.bind(this);
    this.onRenderSuggestion = this.onRenderSuggestion.bind(this);
    this.onRenderSelection = this.onRenderSelection.bind(this);
    this.onGetValue = this.onGetValue.bind(this);
    this.onGetSortKey = this.onGetSortKey.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onInsertLabel = this.onInsertLabel.bind(this);
    this.state = { showModal: false };
  }

  onSearchLabels(token, callback) {
    const newLabelOption = {
      name: <span>New&hellip;</span>,
      id: -1,
    };
    if (token.length === 0) {
      callback([], [newLabelOption]);
    } else {
      this.props.client.query({
        query: LabelQuery,
        variables: { token, project: this.props.project.id },
      }).then(resp => {
        callback(resp.data.labels.slice(0, 5), [newLabelOption]);
      });
    }
  }

  onChooseSuggestion(label) {
    if (label.id === -1) {
      this.setState({ showModal: true });
      return true;
    }
    return false;
  }

  onInsertLabel(label) {
    this.ac.addToSelection(label);
  }

  onRenderSuggestion(label) {
    return <span key={label.id}>{label.name}</span>;
  }

  onRenderSelection(label) {
    return (<Chip style={{ backgroundColor: label.color }} key={label.id}>{label.name}</Chip>);
  }

  onGetValue(label) {
    return label.id;
  }

  onGetSortKey(label) {
    return label.name;
  }

  onCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div>
        {this.state.showModal && (
          <LabelDialog
              project={this.props.project}
              onHide={this.onCloseModal}
              onInsertLabel={this.onInsertLabel} />)}
        <AutocompleteChips
            {...this.props}
            multiple
            onSearch={this.onSearchLabels}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onChooseSuggestion={this.onChooseSuggestion}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
            ref={el => { this.ac = el; }} />
      </div>);
  }
}

LabelSelector.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
  selection: PropTypes.arrayOf(PropTypes.shape({})),
  onSelectionChange: PropTypes.func.isRequired,
};

export default withApollo(LabelSelector);
