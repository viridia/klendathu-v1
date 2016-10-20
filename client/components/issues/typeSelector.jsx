import React from 'react';
import Radio from 'react-bootstrap/lib/Radio';

/** Selects the type of the issue. */
export default class TypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(e.target.dataset.type);
  }

  render() {
    const { template, value } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    return (<div className="issue-type">
      {concreteTypes.map(t => {
        return (<Radio
            key={t.id}
            data-type={t.id}
            checked={t.id === value}
            inline
            onChange={this.onChange}>{t.caption}</Radio>);
      })}
    </div>);
  }
}

TypeSelector.propTypes = {
  value: React.PropTypes.string.isRequired,
  template: React.PropTypes.shape({}).isRequired,
  onChange: React.PropTypes.func.isRequired,
};
