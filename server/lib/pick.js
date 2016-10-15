/** Given a source object, creates a new object that contains only the given keys, and
    only values which are not undefined or null. */
module.exports = function pick(source, props) {
  const result = {};
  props.forEach(key => {
    const value = source[key];
    if (value !== null && value !== undefined) {
      result[key] = source[key];
    }
  });
  return result;
};
