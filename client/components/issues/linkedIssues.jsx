import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import Relation from '../../lib/relation';
import IssueSummary from '../common/issueSummary.jsx';
import './linkedIssues.scss';

export default class LinkedIssues extends React.Component {
  renderLink(link) {
    return (<li className="linked-issue" key={link.to}>
      <span className="relation">{Relation.caption[link.relation]}</span>
      <IssueSummary id={link.to} project={this.props.project.id} />
      {this.props.onRemoveLink &&
        (<Button
            className="bare light"
            onClick={() => this.props.onRemoveLink(link.to)}><CloseIcon /></Button>)}
    </li>);
  }

  render() {
    const { links } = this.props;
    if (!links || links.length === 0) {
      return null;
    }
    return <ul className="linked-issues">{links.map(l => this.renderLink(l))}</ul>;
  }
}

LinkedIssues.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    relation: PropTypes.string.isRequired,
    to: PropTypes.number.isRequired,
  }).isRequired),
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onRemoveLink: PropTypes.func,
};
