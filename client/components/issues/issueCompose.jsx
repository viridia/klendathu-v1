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
      if (state.open) {
        return state.caption;
      } else {
        return <span>Closed: {state.caption}</span>;
      }
    }

    const workflow = this.props.workflow;
    const state = workflow.statesById[this.props.state || workflow.start];
    return (<FormGroup controlId="state">
      <ControlLabel>State</ControlLabel>
      <Radio data-state={state.id} checked onChange={this.onChange}>{caption(state)}</Radio>
      {state.to.map(s => {
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
  render() {
    const { project, workflow } = this.props;
    console.log('IssueCompose:', project, workflow);
    return (<section className="kdt issue-compose">
      <div className="card">
        <header>New Issue: {project.name}</header>
        <section className="content create-issue">
          <div className="left">
            <table className="create-issue-table">
              <tbody>
                <tr>
                  <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                  <td>
                    <div className="issue-type">
                      <Radio inline>Bug</Radio>
                      <Radio inline>Feature</Radio>
                      <Radio inline>Task</Radio>
                      <Radio inline>Story</Radio>
                      <Radio inline>Epic</Radio>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                  <td>
                    <FormControl
                        className="summary"
                        type="text"
                        placeholder="summary of this issue" />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Description:</ControlLabel></th>
                  <td>
                    <FormControl
                        className="description"
                        componentClass="textarea"
                        placeholder="description of this issue" />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Reporter:</ControlLabel></th>
                  <td>
                    <Typeahead
                        className="reporter ac-single"
                        options={['me']}
                        placeholder="me" />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Assign to:</ControlLabel></th>
                  <td>
                    <Typeahead
                        className="assignee ac-single"
                        options={['(unassigned)', 'me']}
                        placeholder="(unassigned)" />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>CC:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <Typeahead
                          className="cc ac-multi"
                          options={['(unassigned)', 'me']} />
                      <Button bsSize="small">Add</Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th />
                  <td>
                    <Checkbox>
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
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
  params: React.PropTypes.shape({
    project: React.PropTypes.string,
  }),
};

export default connect(
  (state, ownProps) => ({
    project: state.projects.byId.get(ownProps.params.project),
    workflow: state.workflows['std/bugtrack'],
  }),
  null,
)(IssueCompose);
