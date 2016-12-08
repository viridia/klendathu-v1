import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import ColumnEntry from './columnEntry.jsx';

/** A list of columns (either visible or available) */
class ColumnList extends React.Component {
  constructor() {
    super();
    this.state = {
      insertionIndex: null,
    };
  }

  drop({ id, isVisible }) {
    this.props.onDrop(id, this.state.insertionIndex, isVisible, this.props.isVisible);
  }

  render() {
    const { columns, isOver, isVisible, connectDropTarget } = this.props;
    const { insertionIndex } = this.state;
    return connectDropTarget(
      <section className={classNames('field-list', { dragOver: isOver })} >
        {columns.map((column, index) =>
          (<li
              key={column.id}
              className={classNames({
                insertBefore: isOver && insertionIndex === 0 && index === 0,
                insertAfter: isOver && insertionIndex === index + 1,
              })}>
            <ColumnEntry column={column} isVisible={isVisible} />
          </li>))}
      </section>
    );
  }
}

ColumnList.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  isOver: PropTypes.bool,
  isVisible: PropTypes.bool,
  connectDropTarget: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

export default DropTarget( // eslint-disable-line
  'column', {
    canDrop(props, monitor) {
      const item = monitor.getItem();
      return item.isVisible || props.isVisible;
    },
    hover(props, monitor, component) {
      if (!monitor.isOver()) {
        component.setState({ insertionIndex: null });
      }
      const pos = monitor.getClientOffset();
      const nodes = ReactDOM.findDOMNode(component).querySelectorAll('li'); // eslint-disable-line
      let index = nodes.length;
      let i = 0;
      for (const node of nodes) {
        if (pos.y < node.offsetTop + (node.offsetHeight / 2)) {
          index = i;
          break;
        }
        i += 1;
      }
      component.setState({ insertionIndex: index });
    },
    drop(props, monitor, component) {
      component.drop(monitor.getItem());
    },
  }, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver() && monitor.canDrop(),
  }),
)(ColumnList);
