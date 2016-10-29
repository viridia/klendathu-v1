import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import { Role } from '../../lib/role';
import './commentEdit.scss';

export default class CommentEdit extends React.Component {
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
    e.preventDefault();
    this.props.onAddComment(this.state.newComment).then(() => {
      this.setState({ newComment: '' });
    });
  }

  render() {
    const { role } = this.props.project;
    return (
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
    );
  }
}

CommentEdit.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.number.isRequired,
  }),
  onAddComment: PropTypes.func.isRequired,
};
