import React, { PropTypes } from 'react';
import { DragSource } from 'react-dnd';

/** A single entry in the list of columns */
function ColumnEntry({ column, isDragging, connectDragSource }) {
  return connectDragSource(<div style={{ opacity: isDragging ? 0.5 : 1.0 }}>{column.title}</div>);
}

ColumnEntry.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isDragging: PropTypes.bool,
  isVisible: PropTypes.bool,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource( // eslint-disable-line
  'column', {
    beginDrag({ column, isVisible }) {
      return { id: column.id, isVisible };
    },
  }, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(ColumnEntry);
