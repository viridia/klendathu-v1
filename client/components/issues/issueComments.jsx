import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import dateFormat from 'dateformat';
import UserName from '../common/userName.jsx';
import { Role } from '../../lib/role';
import { addComment } from '../../store/issue';
import './issueComments.scss';

export default class IssueComments extends React.Component {
  constructor() {
    super();
    this.onChangeCommentBody = this.onChangeCommentBody.bind(this);
    this.onAddComment = this.onAddComment.bind(this);
    this.state = {
      newComment: '',
    };
  }

  onChangeCommentBody(e) {
    this.setState({ newComment: e.target.value });
  }

  onAddComment(e) {
    const { issue, project } = this.props;
    e.preventDefault();
    return addComment(project.id, issue.id, this.state.newComment).then(() => {
      this.setState({ newComment: '' });
      this.props.onChange();
    });
  }

  renderComment(comment) {
    return (
      <section className="comment">
        <header className="comment-header">
          <UserName user={comment.author} full />
          <span className="comment-date">
            {dateFormat(comment.created, 'mmm dS, yyyy h:MM TT')}
          </span>
        </header>
        <div className="comment-body">{comment.body}</div>
      </section>
    );
  }

  render() {
    const { issue } = this.props;
    const { comments = [] } = issue;
    const { role } = this.props.project;
    return (
      <section className="comment-list">
        {comments.map(c => this.renderComment(c))}
        <section className="comment-compose">
          <FormControl
              className="comment-entry"
              componentClass="textarea"
              disabled={role < Role.REPORTER}
              value={this.state.newComment}
              placeholder="Leave a comment..."
              onChange={this.onChangeCommentBody} />
          <Button
              title="add comment"
              disabled={role < Role.REPORTER || this.state.newComment.length === 0}
              onClick={this.onAddComment}>
            Comment
          </Button>
        </section>
      </section>
    );
  }
}

IssueComments.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
};
