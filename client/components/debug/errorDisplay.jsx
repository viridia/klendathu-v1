import React, { PropTypes } from 'react';
import './errorDisplay.scss';

export default class ErrorDisplay extends React.Component {
  constructor() {
    super();
    this.renderGQLError = this.renderGQLError.bind(this);
  }

  renderError(error) {
    // console.log('stack:', error.stack);
    return (
      <section className="error-display">
        <pre>{error.message}</pre>
        <pre className="stack">
          {error.stack}
        </pre>
      </section>
    );
  }

  renderGQLError(error, index) {
    return (
      <div key={index}>
        {error.details && <pre>{error.details.error}</pre>}
        {error.message && <pre>{error.message}</pre>}
        <pre className="stack">
          {error.stack}
        </pre>
      </div>
    );
  }

  render() {
    const { error } = this.props;
    console.error(error);
    if (error.networkError) {
      return this.renderError(error.networkError);
    } else if (error.graphQLErrors) {
      return (
        <section className="error-display">
          {error.graphQLErrors.map(this.renderGQLError)}
        </section>
      );
    }
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
