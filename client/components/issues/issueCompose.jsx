import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Radio from 'react-bootstrap/lib/Radio';
import Typeahead from 'react-bootstrap-typeahead';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import './issues.scss';

class StateSelector extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    e.preventDefault();
  }

  render() {
    function caption(state) {
      if (state.closed) {
        return <span>Closed: {state.caption}</span>;
      } else {
        return state.caption;
      }
    }

    const workflow = this.props.workflow;
    const state = workflow.statesById[this.props.state || workflow.start];
    return (<FormGroup controlId="state">
      <ControlLabel>State</ControlLabel>
      <Radio data-state={state.id} checked onChange={this.onChange}>{caption(state)}</Radio>
      {state.transitions.map(s => {
        const toState = workflow.statesById[s];
        return (<Radio
            key={toState.id}
            data-state={toState.id}
            onChange={this.onChange}>{caption(toState)}</Radio>);
      })}
    </FormGroup>);
  }
}

StateSelector.propTypes = {
  state: React.PropTypes.string,
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
};

class IssueCompose extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeSummary = this.onChangeSummary.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeReporter = this.onChangeReporter.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangePublic = this.onChangePublic.bind(this);
    this.me = { id: props.profile.username, label: props.profile.username };
    this.state = {
      issueType: 'bug',
      public: false,
      summary: '',
      description: '',
      reporter: this.me,
      owner: null,
    };
  }

  onChangeType(e) {
    this.setState({ issueType: e.target.dataset.type });
  }

  onChangeSummary(e) {
    this.setState({ summary: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onChangeReporter(e) {
    this.setState({ reporter: e });
  }

  onChangeOwner(e) {
    this.setState({ owner: e });
  }

  onChangePublic(e) {
    this.setState({ public: e.target.checked });
  }

  render() {
    const { project, workflow } = this.props;
    const issueTypes = [
      { id: 'bug', caption: 'Bug' },
      { id: 'feature', caption: 'Feature' },
      { id: 'task', caption: 'Task' },
      { id: 'story', caption: 'Story' },
      { id: 'epic', caption: 'Epic' },
    ];
    return (<section className="kdt issue-compose">
      <div className="card">
        <header>New Issue: {project.name}</header>
        <section className="content create-issue">
          <div className="left">
            <table className="create-issue-table form-table">
              <tbody>
                <tr>
                  <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                  <td>
                    <div className="issue-type">
                      {issueTypes.map(rank => (
                        <Radio
                            key={rank.id}
                            data-type={rank.id}
                            checked={rank.id === this.state.issueType}
                            onChange={this.onChangeType}
                            inline>{rank.caption}</Radio>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                  <td>
                    <FormControl
                        className="summary"
                        type="text"
                        value={this.state.summary}
                        placeholder="summary of this issue"
                        onChange={this.onChangeSummary} />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Description:</ControlLabel></th>
                  <td>
                    <FormControl
                        className="description"
                        componentClass="textarea"
                        value={this.state.description}
                        placeholder="description of this issue"
                        onChange={this.onChangeDescription} />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Reporter:</ControlLabel></th>
                  <td className="reporter single-static">
                    <span>{this.props.profile.username}</span>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Assign to:</ControlLabel></th>
                  <td>
                    <UserAutoComplete
                        className="assignee ac-single"
                        project={project}
                        placeholder="(unassigned)"
                        defaultSelected={this.state.owner}
                        onChange={this.onChangeOwner} />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>CC:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <UserAutoComplete
                          className="cc ac-multi"
                          project={project}
                          options={['(unassigned)', 'me']} />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th />
                  <td>
                    <Checkbox checked={this.state.public} onChange={this.onChangePublic}>
                      Public
                    </Checkbox>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Labels:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <Typeahead
                          className="labels ac-multi"
                          options={['new...']} />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Keywords:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <Typeahead
                          className="keywords ac-multi"
                          options={['(unassigned)', 'me']} />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Attach files:</ControlLabel></th>
                  <td>
                    <div className="upload">
                      Drop files here to upload (or click)
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Linked Issues:</ControlLabel></th>
                  <td>
                    <div className="linked-group">
                      <DropdownButton bsSize="small" title="Blocked By" id="issue-link-type">
                        <MenuItem eventKey="1" active>Blocked By</MenuItem>
                        <MenuItem eventKey="2">Blocks</MenuItem>
                        <MenuItem eventKey="3">Duplicates</MenuItem>
                        <MenuItem eventKey="4">Related to</MenuItem>
                        <MenuItem eventKey="5">Child of</MenuItem>
                        <MenuItem eventKey="6">Parent of</MenuItem>
                      </DropdownButton>
                      <Typeahead
                          className="linked-issue"
                          options={['new...']} />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Comments:</ControlLabel></th>
                  <td>
                    <div className="add-comment-group">
                      <FormControl
                          className="add-comment"
                          componentClass="textarea"
                          placeholder="add a comment..." />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <aside className="right">
            <StateSelector project={project} workflow={workflow} state="new" />
          </aside>
        </section>
        <footer className="submit-buttons">
          <Button>Cancel</Button>
          <Button bsStyle="primary">Create</Button>
        </footer>
      </div>
    </section>);
  }
}

IssueCompose.propTypes = {
  profile: React.PropTypes.shape({
    username: React.PropTypes.string,
  }),
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
  params: React.PropTypes.shape({
    project: React.PropTypes.string,
  }),
};

export default connect(
  (state, ownProps) => ({
    profile: state.profile,
    project: state.projects.byId.get(ownProps.params.project),
    workflow: state.workflows['std/bugtrack'],
  }),
  null,
)(IssueCompose);
