import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import UserName from '../common/userName.jsx';
import roleName from '../../lib/role.js';
import { deleteProject } from '../../store/projects';
import './projectCard.scss';

export default class ProjectCard extends React.Component {
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
    deleteProject(this.props.project.id);
  }

  render() {
    const { project } = this.props;
    return (
      <div className="card internal project-card" key={project.name}>
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
          <div className="project-name">
            <Link className="project-link" to={{ pathname: `/project/${project.name}/issues` }}>
              {project.name}
            </Link>
            <div className="description">{project.title}</div>
          </div>
          <div className="project-owner">
            <div className="owned-by">
              <span className="title">Owned by: </span>
              <UserName user={project.owningUser} />
            </div>
            <div className="role">
              <span className="title">Role: </span>
              {roleName(project.role).toLowerCase()}
            </div>
          </div>
          <div>
            <Button bsStyle="primary" onClick={this.onShowDelete}>Delete</Button>
          </div>
        </div>
      </div>
    );
  }
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};
