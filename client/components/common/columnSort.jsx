import React, { PropTypes } from 'react';

/** Component that functions as a column heading and allows control of sort order for that
    column. */
export default class ColumnSort extends React.Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    const { column, sortKey, descending } = this.props;
    if (column !== sortKey) {
      // If this is not the current column then it always sorts descending.
      this.props.onChangeSort(column, false);
    } else {
      // Otherwise it toggles the sort order.
      this.props.onChangeSort(column, !descending);
    }
  }

  render() {
    const { className, column, children, sortKey, descending } = this.props;
    return (
      <button className={className} onClick={this.onClick}>
        {children}
        {sortKey === column &&
          (descending
            ? <span className="sort descend">&#x25b2;</span>
            : <span className="sort ascend">&#x25bc;</span>)}
      </button>
    );
  }
}

ColumnSort.propTypes = {
  className: PropTypes.string,
  column: PropTypes.string.isRequired,
  children: PropTypes.node,
  sortKey: PropTypes.string,
  descending: PropTypes.bool,
  onChangeSort: PropTypes.func.isRequired,
};
