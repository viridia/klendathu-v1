import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { toastr } from 'react-redux-toastr';
import gql from 'graphql-tag';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Typeahead from 'react-bootstrap-typeahead';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import LabelSelector from './labelSelector.jsx';
import StateSelector from './stateSelector.jsx';
import TypeSelector from './typeSelector.jsx';
import CustomEnumField from './customEnumField.jsx';
import UserName from '../common/userName.jsx';
import { setIssueType, setIssueState, setIssueSummary, setIssueDescription, setCustomField,
  addIssueCC, addIssueComment, resetIssue } from '../../store/actions';
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
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    default: PropTypes.string,
    max_length: PropTypes.number,
  }).isRequired,
  issue: PropTypes.shape({}),
  setCustomField: PropTypes.func.isRequired,
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
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    default: PropTypes.string,
    max_length: PropTypes.number,
  }).isRequired,
  issue: PropTypes.shape({}),
  setCustomField: PropTypes.func.isRequired,
};

class IssueCompose extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeSummary = this.onChangeSummary.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeReporter = this.onChangeReporter.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangePublic = this.onChangePublic.bind(this);
    this.onChangeAnother = this.onChangeAnother.bind(this);
    this.onChangeCommentText = this.onChangeCommentText.bind(this);
    this.onAddCC = this.onAddCC.bind(this);
    this.onAddComment = this.onAddComment.bind(this);
    this.onInputKeyDown = this.onInputKeyDown.bind(this);
    this.onFocusNext = this.onFocusNext.bind(this);
    this.onFocusPrev = this.onFocusPrev.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.me = { id: context.profile.username, label: context.profile.username };
    this.templateTypes = new Map();
    this.state = {
      selectedState: 'new',
      summaryError: '',
      descriptionError: '',
      public: false,
      reporter: this.me,
      owner: null,
      commentText: '',
      another: false,
    };
  }

  componentDidMount() {
    this.buildTypeMap();
    this.reset();
  }

  componentDidUpdate() {
    // if (prevProps.issue.id !== this.props.issue.id) {
    //   this.reset();
    // }
    this.buildTypeMap();
  }

  onInputKeyDown(e) {
    if (e.keyCode === 13) { // ENTER
      e.preventDefault();
      this.onFocusNext();
    }
  }

  onFocusNext() {
    this.navigate(1);
  }

  onFocusPrev() {
    this.navigate(-1);
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

  onChangeAnother(e) {
    this.setState({ another: e.target.checked });
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
      author: this.context.profile.id,
      body: this.state.commentText,
    });
    this.setState({ commentText: '' });
  }

  onCreate(e) {
    e.preventDefault();
    const issue = Object.assign({}, this.props.issue, { custom: [] });
    const issueType = this.templateTypes.get(issue.type);
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      const fieldValue = issue.custom[field.id] || field.default;
      if (fieldValue) {
        issue.custom.push({
          name: field.id,
          value: fieldValue,
        });
      }
    }
    this.props.newIssue({
      variables: {
        issue,
        project: this.props.project.id,
      },
    }).then(resp => {
      console.log('onCreate', resp);
      toastr.success(`Issue #${resp.data.newIssue.id} created.`);
      this.reset();
    });
    // console.log('create', this.props.issue);
  }

  reset() {
    const { project } = this.props;
    const concreteTypes = project.template.types.filter(t => !t.abstract);
    const initialState = project.workflow.start || 'new';
    this.setState({ selectedState: initialState });
    this.props.resetIssue();
    this.props.setIssueType(concreteTypes[0].id);
    this.props.setIssueState(initialState);
    this.props.setIssueSummary('');
    this.props.setIssueDescription('');
  }

  buildTypeMap() {
    this.templateTypes = new Map();
    const { project } = this.props;
    for (const type of project.template.types) {
      this.templateTypes.set(type.id, type);
    }
  }

  navigate(dir) {
    const activeEl = document.activeElement;
    let activeIndex = -1;
    for (let i = 0; i < this.form.elements.length; i += 1) {
      if (this.form.elements[i] === activeEl) {
        activeIndex = i;
        break;
      }
    }
    activeIndex += dir;
    if (activeIndex < 0) {
      activeIndex = this.form.elements.length - 1;
    } else if (activeIndex >= this.form.elements.length) {
      activeIndex = 0;
    }
    const nextActive = this.form.elements[activeIndex];
    if (nextActive) {
      nextActive.focus();
    }
  }

  customFieldList(issueType) {
    let fields = [];
    if (issueType.extends && issueType.extends.startsWith('./')) {
      const parentType = this.templateTypes.get(issueType.extends.slice(2));
      if (parentType) {
        fields = this.customFieldList(parentType);
      }
    }
    if (issueType.fields) {
      fields = fields.concat(issueType.fields);
    }
    return fields;
  }

  renderCustomFields(issueType, result) {
    const { issue } = this.props;
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      let component = null;
      switch (field.type) {
        case 'TEXT':
          component = (<CustomSuggestField
              issue={issue} field={field} setCustomField={this.props.setCustomField} />);
          break;
        case 'ENUM':
          component = (<CustomEnumField field={field} />);
          break;
        default:
          console.error('invalid field type:', field.type);
          break;
      }
      if (component) {
        result.push(<tr key={field.id}>
          <th>{field.caption}:</th>
          <td>{component}</td>
        </tr>);
      }
    }
    return result;
  }

  renderTemplateFields() {
    const { issue } = this.props;
    const issueType = this.templateTypes.get(issue.type);
    const result = [];
    if (issueType) {
      return this.renderCustomFields(issueType, result);
    }
    return result;
  }

  render() {
    const { project, issue } = this.props;
    return (<section className="kdt issue-compose">
      <div className="card">
        <header>New Issue: {project.name}</header>
        <section className="content create-issue">
          <div className="left">
            <form ref={el => { this.form = el; }}>
              <table className="create-issue-table form-table">
                <tbody>
                  <tr>
                    <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                    <td><TypeSelector template={project.template} /></td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                    <td>
                      <FormControl
                          className="summary"
                          type="text"
                          value={issue.summary || ''}
                          placeholder="one-line summary of this issue"
                          onChange={this.onChangeSummary}
                          onKeyDown={this.onInputKeyDown} />
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
                      <span>{this.context.profile.username}</span>
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
                          onChange={this.onChangeOwner}
                          onFocusNext={this.onFocusNext} />
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>CC:</ControlLabel></th>
                    <td>
                      <div className="ac-multi-group">
                        <UserAutoComplete
                            className="assignee ac-multi"
                            project={project}
                            multiple
                            onFocusNext={this.onFocusNext} />
                      </div>
                    </td>
                  </tr>
                  {this.renderTemplateFields()}
                  <tr>
                    <th className="header"><ControlLabel>Labels:</ControlLabel></th>
                    <td>
                      <div className="ac-multi-group">
                        <LabelSelector
                            id="labels"
                            className="labels ac-multi"
                            project={project}
                            onFocusNext={this.onFocusNext} />
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
            </form>
          </div>
          <aside className="right">
            <StateSelector
                project={project}
                workflow={project.workflow}
                state={this.state.selectedState} />
            <ControlLabel>Visbility</ControlLabel>
            <Checkbox checked={this.state.public} onChange={this.onChangePublic}>
              Public
            </Checkbox>
          </aside>
        </section>
        <footer className="submit-buttons">
          <Checkbox checked={this.state.another} onChange={this.onChangeAnother}>
            Create another
          </Checkbox>
          <Button>Cancel</Button>
          <Button
              bsStyle="primary"
              disabled={!issue.summary}
              onClick={this.onCreate}><AddBoxIcon />Create</Button>
        </footer>
      </div>
    </section>);
  }
}

IssueCompose.propTypes = {
  issue: PropTypes.shape({}),
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    workflow: PropTypes.shape({}),
    template: PropTypes.shape({}),
  }).isRequired,
  params: PropTypes.shape({
    project: PropTypes.string,
  }).isRequired,
  addIssueCC: PropTypes.func.isRequired,
  addIssueComment: PropTypes.func.isRequired,
  resetIssue: PropTypes.func.isRequired,
  setIssueType: PropTypes.func.isRequired,
  setIssueState: PropTypes.func.isRequired,
  setIssueSummary: PropTypes.func.isRequired,
  setIssueDescription: PropTypes.func.isRequired,
  setCustomField: PropTypes.func.isRequired,
  newIssue: PropTypes.func.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

IssueCompose.contextTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
};

const NewIssueMutation = gql`mutation NewIssueMutation($project: ID!, $issue: IssueInput!) {
  newIssue(project: $project, issue: $issue) {
    id
  }
}`;

const UpdateIssueMutation = gql`mutation UpdateIssueMutation($id: ID!, $issue: IssueInput!) {
  updateIssue(id: $id, issue: $issue) {
    id
  }
}`;

export default graphql(NewIssueMutation, { name: 'newIssue' })(
  graphql(UpdateIssueMutation, { name: 'updateIssue' })(
  connect(
    (state) => ({
      issue: state.issue,
    }),
    dispatch => bindActionCreators({
      addIssueCC,
      addIssueComment,
      resetIssue,
      setIssueType,
      setIssueState,
      setIssueSummary,
      setIssueDescription,
      setCustomField,
    }, dispatch)
)(IssueCompose)));
