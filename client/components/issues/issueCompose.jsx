import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FormControl from 'react-bootstrap/lib/FormControl';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Typeahead from 'react-bootstrap-typeahead';
import UserAutoComplete from '../common/userAutoComplete.jsx';
import LabelSelector from './labelSelector.jsx';
import StateSelector from './stateSelector.jsx';
import TypeSelector from './typeSelector.jsx';
import CustomEnumField from './customEnumField.jsx';
import UserName from '../common/userName.jsx';
import './issues.scss';

class CustomTextField extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(this.props.field.id, e.target.value);
  }

  render() {
    const { value, field } = this.props;
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
  value: React.PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

class CustomSuggestField extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onChange(selected) {
    console.log(selected);
    // this.props.onChange(this.props.field.id, e.target.value);
  }

  onInputChange(text) {
    console.log(text);
  }

  render() {
    const { value } = this.props;
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
  value: React.PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default class IssueCompose extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeSummary = this.onChangeSummary.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeReporter = this.onChangeReporter.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onChangeCC = this.onChangeCC.bind(this);
    this.onChangeLabels = this.onChangeLabels.bind(this);
    this.onChangeCustomField = this.onChangeCustomField.bind(this);
    this.onChangePublic = this.onChangePublic.bind(this);
    this.onChangeAnother = this.onChangeAnother.bind(this);
    this.onChangeCommentText = this.onChangeCommentText.bind(this);
    this.onAddComment = this.onAddComment.bind(this);
    this.onInputKeyDown = this.onInputKeyDown.bind(this);
    this.onFocusNext = this.onFocusNext.bind(this);
    this.onFocusPrev = this.onFocusPrev.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.me = { id: context.profile.username, label: context.profile.username };
    this.templateTypes = new Map();
    this.state = {
      startringState: 'new',
      issueState: 'new',
      type: '',
      summary: '',
      summaryError: '',
      description: '',
      descriptionError: '',
      public: false,
      reporter: this.me,
      owner: null,
      cc: [],
      labels: [],
      custom: Immutable.Map.of(),
      commentText: '',
      comments: [],
      another: false,
    };
  }

  componentDidMount() {
    this.buildTypeMap(this.props.project);
    this.reset();
  }

  componentWillUpdate(nextProps) {
    const thisId = this.props.issue && this.props.issue.id;
    const nextId = nextProps.issue && nextProps.issue.id;
    if (thisId !== nextId) {
      this.reset();
    }
    this.buildTypeMap(nextProps.project);
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

  onChangeType(value) {
    this.setState({ type: value });
  }

  onChangeState(st) {
    this.setState({ issueState: st });
  }

  onChangeSummary(e) {
    // TODO: validate length
    this.setState({ summary: e.target.value });
  }

  onChangeDescription(e) {
    // TODO: validate length
    this.setState({ description: e.target.value });
  }

  onChangeReporter(e) {
    this.setState({ reporter: e });
  }

  onChangeOwner(selection) {
    this.setState({ owner: selection });
  }

  onChangeCC(selection) {
    this.setState({ cc: selection });
  }

  onChangeLabels(selection) {
    this.setState({ labels: selection });
  }

  onChangeCustomField(id, value) {
    this.setState({ custom: this.state.custom.set(id, value) });
  }

  onChangePublic(e) {
    this.setState({ public: e.target.checked });
  }

  onChangeAnother(e) {
    this.setState({ another: e.target.checked });
  }

  onChangeCommentText(e) {
    this.setState({ commentText: e.target.value });
  }

  onAddComment(e) {
    e.preventDefault();
    const newComment = {
      author: this.context.profile.id,
      body: this.state.commentText,
    };
    this.setState({
      comments: this.state.comments.concate([newComment]),
      commentText: '',
    });
  }

  onCreate(e) {
    e.preventDefault();
    const issue = Object.assign({}, this.props.issue, {
      state: this.state.issueState,
      type: this.state.type,
      owner: this.state.owner ? this.state.owner.id : undefined,
      cc: this.state.cc.map(cc => cc.id),
      labels: this.state.labels.map(label => label.id),
      custom: [],
    });
    const issueType = this.templateTypes.get(issue.type);
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      const fieldValue = this.state.custom.get(field.id) || field.default;
      if (fieldValue) {
        issue.custom.push({
          name: field.id,
          value: fieldValue,
        });
      }
    }
    return this.props.onSave(issue).then(() => {
      this.reset();
    });
  }

  reset() {
    const { project, issue } = this.props;
    const concreteTypes = project.template.types.filter(t => !t.abstract);
    if (issue) {
      this.setState({
        startingState: issue.state,
        issueState: issue.state,
        type: issue.type,
        summary: issue.summary,
        description: issue.description,
        reporter: issue.reporter,
        owner: issue.ownerData,
        cc: issue.ccData,
        custom: issue.custom
            ? new Immutable.Map(issue.custom.map(custom => [custom.name, custom.value]))
            : Immutable.Map.of(),
        labels: issue.labelsData,
        comments: issue.comments,
        public: !!issue.public,
      });
    } else {
      const initialState = project.workflow.start || 'new';
      this.setState({
        startingState: initialState,
        issueState: initialState,
        type: concreteTypes[0].id,
        summary: '',
        description: '',
        reporter: this.me,
        owner: null,
        cc: [],
        custom: Immutable.Map.of(),
        labels: [],
        comments: [],
        public: false,
      });
    }
  }

  buildTypeMap(project) {
    this.templateTypes = new Map();
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
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      let component = null;
      const value = this.state.custom.get(field.id) || field.default || '';
      switch (field.type) {
        case 'TEXT':
          component = (<CustomSuggestField
              value={value}
              field={field}
              onChange={this.onChangeCustomField} />);
          break;
        case 'ENUM':
          component = (<CustomEnumField
              value={value}
              field={field}
              onChange={this.onChangeCustomField} />);
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
    const issueType = this.templateTypes.get(this.state.type);
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
                    <td>
                      <TypeSelector
                          value={this.state.type}
                          template={project.template}
                          onChange={this.onChangeType} />
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                    <td>
                      <FormControl
                          className="summary"
                          type="text"
                          value={this.state.summary}
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
                          value={this.state.description}
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
                          selection={this.state.owner}
                          onSelectionChange={this.onChangeOwner}
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
                            selection={this.state.cc}
                            onSelectionChange={this.onChangeCC}
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
                            selection={this.state.labels}
                            onSelectionChange={this.onChangeLabels}
                            onFocusNext={this.onFocusNext} />
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
                      {this.state.comments && this.state.comments.map((comment, index) =>
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
                state={this.state.issueState}
                startingState={this.state.startingState}
                onStateChanged={this.onChangeState} />
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
          {issue
            ? (<Button
                bsStyle="primary"
                disabled={!this.state.summary}
                onClick={this.onCreate}>Save</Button>)
            : (<Button
                bsStyle="primary"
                disabled={!this.state.summary}
                onClick={this.onCreate}>Create</Button>)}
        </footer>
      </div>
    </section>);
  }
}

IssueCompose.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    workflow: PropTypes.shape({}),
    template: PropTypes.shape({}),
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

IssueCompose.contextTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
};
