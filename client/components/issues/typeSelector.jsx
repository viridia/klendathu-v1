import React from 'react';
import Radio from 'react-bootstrap/lib/Radio';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setIssueType } from '../../store/actions';

/** Selects the type of the issue. */
class TypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.setIssueType(e.target.dataset.type);
  }

  render() {
    const { template, issue } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    const selected = issue.type;
    return (<div className="issue-type">
      {concreteTypes.map(t => {
        return (<Radio
            key={t.id}
            data-type={t.id}
            checked={t.id === selected}
            inline
            onChange={this.onChange}>{t.caption}</Radio>);
      })}
    </div>);
  }
}

TypeSelector.propTypes = {
  issue: React.PropTypes.shape({}).isRequired,
  template: React.PropTypes.shape({}).isRequired,
  setIssueType: React.PropTypes.func,
};

export default connect(
  (state) => ({
    issue: state.issue,
  }),
  dispatch => bindActionCreators({ setIssueType }, dispatch)
)(TypeSelector);
