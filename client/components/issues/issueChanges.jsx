import React, { PropTypes } from 'react';
import marked from 'marked';
import RelativeDate from '../common/relativeDate.jsx';
import IssueSummary from '../common/issueSummary.jsx';
import LabelName from '../common/labelName.jsx';
import UserName from '../common/userName.jsx';
import Relation from '../../lib/relation';
import './issueChanges.scss';

function compareEntries(a, b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  return 0;
}

function renderBody(body) {
  return <div className="comment-body" dangerouslySetInnerHTML={{ __html: marked(body) }} />; // eslint-disable-line
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
      {renderBody(comment.body)}
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
  function linkChange({ to, before, after }) { // eslint-disable-line
    if (before && after) {
      return (<li className="field-change linked-issue" key={to}>
        changed <span className="relation">{Relation.caption[before]}</span>
      &nbsp;%raquo;&nbsp;
        <span className="relation">{Relation.caption[after]}</span>
        <IssueSummary id={to} project={project.id} key={to} />
      </li>);
    } else if (before) {
      return (<li className="field-change linked-issue" key={to}>
        removed <span className="relation">{Relation.caption[before]}</span>
        <IssueSummary id={to} project={project.id} key={to} />
      </li>);
    } else {
      return (<li className="field-change linked-issue" key={to}>
        added <span className="relation">{Relation.caption[after]}</span>
        <IssueSummary id={to} project={project.id} key={to} />
      </li>);
    }
  }

  function customValue(value) {
    return value !== null
      ? <span className="custom-value">{value || '""'}</span>
      : <span className="custom-value-none">(none)</span>;
  }

  function customChange({ name, before, after }) { // eslint-disable-line
    return (
      <li className="field-change custom-field" key={name}>
        changed <span className="field-name">
          {name}
        </span> from {customValue(before)} to {customValue(after)}
      </li>);
  }

  return (<section className="change">
    <header className="change-header">
      <UserName user={change.by} fullOnly />
      &nbsp;made changes&nbsp;
      <RelativeDate date={new Date(change.at)} />
      :
    </header>
    <ul className="field-change-list">
      {change.type && (
        <li className="field-change">
          type: <span className="type">
            {change.type.before}
          </span> to <span className="type">
            {change.type.after}
          </span>
        </li>)}
      {change.state && (
        <li className="field-change">
          state: <span className="state">
            {change.state.before}
          </span> to <span className="state">
            {change.state.after}
          </span>
        </li>)}
      {change.summary && (<li className="field-change">
        changed <span className="field-name">summary</span> from &quot;
        {change.summary.before}&quot; to &quot;
        {change.summary.after}&quot;
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
      {change.attachments && change.attachments.addedData && change.attachments.addedData.map(a =>
        (<li className="field-change" key={a.id}>
          attached file <span className="attachment">{a.filename}</span>
        </li>))}
      {change.attachments && change.attachments.removedData &&
          change.attachments.removedData.map(a =>
        (<li className="field-change" key={a.id}>
          removed file <span className="attachment">{a.filename}</span>
        </li>))}
      {change.linked && change.linked.map(linkChange)}
      {change.custom && change.custom.map(customChange)}
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
    type: PropTypes.string.isRequired,
  }),
  comments: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  changes: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
    template: PropTypes.shape({}),
  }),
};
