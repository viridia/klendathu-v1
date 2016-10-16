import React, { PropTypes } from 'react';
import './errorDisplay.scss';

export default class ErrorDisplay extends React.Component {
  renderError(error) {
    console.log('stack:', error.stack);
    return (
      <section className="error-display">
        <pre>{error.message}</pre>
        <pre className="stack">
          {error.stack}
        </pre>
      </section>
    );
  }

  render() {
    const { error } = this.props;
    if (error.networkError) {
      return this.renderError(error.networkError);
    }
    console.error(error.networkError.stack);
    return (
      <section className="error-display">
        {error.message}
      </section>
    );
  }
}

ErrorDisplay.propTypes = {
  error: PropTypes.shape({}),
};
