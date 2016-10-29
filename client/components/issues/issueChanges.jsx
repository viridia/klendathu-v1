import React, { PropTypes } from 'react';
import RelativeDate from '../common/relativeDate.jsx';
import LabelName from '../common/labelName.jsx';
import UserName from '../common/userName.jsx';
import './issueChanges.scss';

function compareEntries(a, b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  return 0;
}

function Comment({ comment }) {
  return (
    <section className="comment">
      <header className="comment-header">
        <UserName user={comment.author} fullOnly />
        &nbsp;commented&nbsp;
        <RelativeDate date={new Date(comment.created)} />
        :
      </header>
      <div className="comment-body">{comment.body}</div>
    </section>
  );
}

Comment.propTypes = {
  comment: PropTypes.shape({
    author: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  }).isRequired,
};

function Change({ change, project }) {
  return (<section className="change">
    <header className="change-header">
      <UserName user={change.by} fullOnly />
      &nbsp;made changes&nbsp;
      <RelativeDate date={new Date(change.at)} />
      :
    </header>
    <ul className="field-change-list">
      {change.type && (<li className="field-change">
          type: {change.type.before} to {change.type.after}
        </li>)}
      {change.state &&
        <li className="field-change">state: {change.state.before} to {change.state.after}</li>}
      {change.summary && (<li className="field-change">
        summary: {change.summary.before} to {change.summary.after}
      </li>)}
      {change.owner &&
        <li className="field-change">owner: {change.owner.before} to {change.owner.after}</li>}
      {change.cc && change.cc.added && change.cc.added.map(cc =>
        (<li className="field-change" key={cc}>added <UserName user={cc} full /> to cc</li>))}
      {change.cc && change.cc.removed && change.cc.removed.map(cc =>
        (<li className="field-change" key={cc}>removed <UserName user={cc} full /> from cc</li>))}
      {change.labels && change.labels.added && change.labels.added.map(l =>
        (<li className="field-change" key={l}>
          added label <LabelName label={l} project={project.id} key={l} />
        </li>))}
      {change.labels && change.labels.removed && change.labels.removed.map(l =>
        (<li className="field-change" key={l}>
          removed label <LabelName label={l} project={project.id} key={l} />
        </li>))}
    </ul>
  </section>);
}

Change.propTypes = {
  change: PropTypes.shape({
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
};

export default class IssueChanges extends React.Component {
  sortEntriesByDate() {
    const { comments, changes, project } = this.props;
    const result = [];
    if (comments) {
      comments.forEach(c => {
        result.push([new Date(c.created), <Comment comment={c} key={result.length} />]);
      });
    }
    if (changes) {
      changes.forEach(c => {
        result.push([new Date(c.at), <Change change={c} key={result.length} project={project} />]);
      });
    }
    result.sort(compareEntries);
    return result;
  }

  render() {
    return (
      <section className="changes-list">
        {this.sortEntriesByDate().map(entry => entry[1])}
      </section>
    );
  }
}

IssueChanges.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  comments: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  changes: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
};
