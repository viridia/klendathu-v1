import React from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import UserName from '../common/userName.jsx';
import { deleteProject } from '../../store/projects';
import './projectCard.scss';

class ProjectCard extends React.Component {
  constructor() {
    super();
    this.onShowDelete = this.onShowDelete.bind(this);
    this.onHideDelete = this.onHideDelete.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.state = { showDelete: false };
  }

  onShowDelete(ev) {
    ev.preventDefault();
    this.setState({ showDelete: true });
  }

  onHideDelete(ev) {
    ev.preventDefault();
    this.setState({ showDelete: false });
  }

  onConfirmDelete(ev) {
    ev.preventDefault();
    this.setState({ showDelete: false });
    this.props.deleteProject(this.props.project.name);
    console.log('delete project');
  }

  render() {
    const { project, user } = this.props;
    return (
      <div className="project-card" key={project.name}>
        {this.state.showDelete && (
          <Modal show onHide={this.onHideDelete}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you absolutely sure you want to delete this project?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.onConfirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        )}
        <div className="project-info">
          <Link className="project-link" to={{ pathname: `/issues/${project.name}` }}>
            {project.name}
          </Link>
          <div className="project-owner">
            <div className="owned-by">
              Owned by: <UserName user={project.owningUser} />
            </div>
            <div className="owned-by">
              {user.id === project.owningUser && <span>role: owner</span>}
            </div>
          </div>
          <Button bsStyle="primary" onClick={this.onShowDelete}>Delete</Button>
        </div>
      </div>
    );
  }
}

ProjectCard.propTypes = {
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
  }).isRequired,
  user: React.PropTypes.shape({
    // id: React.PropTypes.string,
  }),
  deleteProject: React.PropTypes.func.isRequired,
};

export default connect(
  null,
  dispatch => bindActionCreators({ deleteProject }, dispatch),
)(ProjectCard);
