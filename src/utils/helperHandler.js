function asyncWrapper(fn) {
  return async (req, res, next) => {
    try {
      return await fn.apply(null, [req, res, next]);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  asyncWrapper
};
