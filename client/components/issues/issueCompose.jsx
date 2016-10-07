import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Typeahead from 'react-bootstrap-typeahead';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import StateSelector from './stateSelector.jsx';
import TypeSelector from './typeSelector.jsx';
import CustomEnumField from './customEnumField.jsx';
import UserName from '../common/userName.jsx';
import { setIssueType, setIssueSummary, setIssueDescription, setCustomField, addIssueCC,
  addIssueComment, resetIssue } from '../../store/issues';
import './issues.scss';

class CustomTextField extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.setCustomField(this.props.field.id, e.target.value);
  }

  render() {
    const { issue, field } = this.props;
    const value = (issue.custom && issue.custom.get(field.id)) || field.default || '';
    return (
      <FormControl
          type="text"
          value={value}
          maxLength={field.max_length}
          onChange={this.onChange} />
      );
  }
}

CustomTextField.propTypes = {
  field: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    default: React.PropTypes.string,
    max_length: React.PropTypes.number,
  }).isRequired,
  issue: React.PropTypes.shape({}),
  setCustomField: React.PropTypes.func.isRequired,
};

class CustomSuggestField extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onChange(selected) {
    console.log(selected);
    // this.props.setCustomField(this.props.field.id, e.target.value);
  }

  onInputChange(text) {
    console.log(text);
  }

  render() {
    const { issue, field } = this.props;
    const value = (issue.custom && issue.custom.get(field.id)) || field.default || '';
    return (
      <Typeahead
          className="keywords ac-multi"
          defaultSelected={[value]}
          options={[]}
          onChange={this.onChange}
          onInputChange={this.onInputChange}
          allowNew
          newSelectionPrefix=""
          emptyLabel="No suggestions" />
      );
  }
}

CustomSuggestField.propTypes = {
  field: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    default: React.PropTypes.string,
    max_length: React.PropTypes.number,
  }).isRequired,
  issue: React.PropTypes.shape({}),
  setCustomField: React.PropTypes.func.isRequired,
};

class IssueCompose extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSummary = this.onChangeSummary.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeReporter = this.onChangeReporter.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangePublic = this.onChangePublic.bind(this);
    this.onChangeCommentText = this.onChangeCommentText.bind(this);
    this.onAddCC = this.onAddCC.bind(this);
    this.onAddComment = this.onAddComment.bind(this);
    this.me = { id: props.profile.username, label: props.profile.username };
    this.state = {
      summaryError: '',
      descriptionError: '',
      public: false,
      reporter: this.me,
      owner: null,
      commentText: '',
    };
  }

  componentDidMount() {
    this.reset();
  }

  onChangeSummary(e) {
    // TODO: validate length
    this.props.setIssueSummary(e.target.value);
  }

  onChangeDescription(e) {
    // TODO: validate length
    this.props.setIssueDescription(e.target.value);
  }

  onChangeReporter(e) {
    this.setState({ reporter: e });
  }

  onChangeOwner(e) {
    console.log(e);
    this.setState({ owner: e });
  }

  onChangePublic(e) {
    this.setState({ public: e.target.checked });
  }

  onAddCC(e) {
    this.props.addIssueCC(e.id);
  }

  onChangeCommentText(e) {
    this.setState({ commentText: e.target.value });
  }

  onAddComment(e) {
    e.preventDefault();
    this.props.addIssueComment({
      author: this.props.profile.id,
      body: this.state.commentText,
    });
    this.setState({ commentText: '' });
  }

  reset() {
    const { template } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    this.props.resetIssue();
    this.props.setIssueType(concreteTypes[0].id);
  }

  renderCustomFields(schema, result) {
    const { issue, template } = this.props;
    if (schema.extends && schema.extends.startsWith('./')) {
      const parentSchema = template.typesById[schema.extends.slice(2)];
      if (parentSchema) {
        this.renderCustomFields(parentSchema, result);
      }
    }
    if (schema.fields) {
      for (const field of schema.fields) {
        let component = null;
        switch (field.type) {
          case 'text':
            component = (<CustomSuggestField
                issue={issue} field={field} setCustomField={this.props.setCustomField} />);
            break;
          case 'enum':
            component = (<CustomEnumField field={field} />);
            break;
          default:
            break;
        }
        if (component) {
          result.push(<tr key={field.id}>
            <th>{field.caption}:</th>
            <td>{component}</td>
          </tr>);
        }
      }
    }
    return result;
  }

  renderTemplateFields() {
    const { template, issue } = this.props;
    const schema = template.typesById[issue.type];
    const result = [];
    if (schema) {
      return this.renderCustomFields(schema, result);
    }
    return result;
  }

  render() {
    const { project, workflow, issue } = this.props;
    return (<section className="kdt issue-compose">
      <div className="card">
        <header>New Issue: {project.name}</header>
        <section className="content create-issue">
          <div className="left">
            <table className="create-issue-table form-table">
              <tbody>
                <tr>
                  <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                  <td><TypeSelector /></td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                  <td>
                    <FormControl
                        className="summary"
                        type="text"
                        value={issue.summary || ''}
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
                        value={issue.description || ''}
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
                        value={this.state.owner}
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
                          onChange={this.onAddCC} />
                      <Button bsSize="small">Add</Button>
                    </div>
                    <ul>
                      {issue.cc && issue.cc.map(
                        u => <li key={u}><UserName user={u} /></li>)}
                    </ul>
                  </td>
                </tr>
                {this.renderTemplateFields()}
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
                    {issue.comments && issue.comments.map((comment, index) =>
                      (<div className="comment card internal" key={index}>
                        <div className="author"><UserName user={comment.author} /></div>
                        {comment.body}
                      </div>))}
                    <div className="add-comment-group">
                      <FormControl
                          className="add-comment"
                          componentClass="textarea"
                          placeholder="add a comment..."
                          value={this.state.commentText}
                          onChange={this.onChangeCommentText} />
                      <Button
                          bsSize="small"
                          disabled={this.state.commentText.length === 0}
                          onClick={this.onAddComment}>Add</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <aside className="right">
            <StateSelector project={project} workflow={workflow} state="new" />
            <ControlLabel>Visbility</ControlLabel>
            <Checkbox checked={this.state.public} onChange={this.onChangePublic}>
              Public
            </Checkbox>
          </aside>
        </section>
        <footer className="submit-buttons">
          <Button>Cancel</Button>
          <Button bsStyle="primary"><AddBoxIcon />Create</Button>
        </footer>
      </div>
    </section>);
  }
}

IssueCompose.propTypes = {
  profile: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired,
  }),
  issue: React.PropTypes.shape({}),
  project: React.PropTypes.shape({}),
  workflow: React.PropTypes.shape({}),
  template: React.PropTypes.shape({}),
  params: React.PropTypes.shape({
    project: React.PropTypes.string,
  }),
  addIssueCC: React.PropTypes.func.isRequired,
  addIssueComment: React.PropTypes.func.isRequired,
  resetIssue: React.PropTypes.func.isRequired,
  setIssueType: React.PropTypes.func.isRequired,
  setIssueSummary: React.PropTypes.func.isRequired,
  setIssueDescription: React.PropTypes.func.isRequired,
  setCustomField: React.PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => ({
    profile: state.profile,
    project: state.projects.byId.get(ownProps.params.project),
    workflow: state.workflows['std/bugtrack'],
    template: state.templates['std/software'],
    issue: state.issues.$edit,
  }),
  dispatch => bindActionCreators({
    addIssueCC,
    addIssueComment,
    resetIssue,
    setIssueType,
    setIssueSummary,
    setIssueDescription,
    setCustomField,
  }, dispatch)
)(IssueCompose);
