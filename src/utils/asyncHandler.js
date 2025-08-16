// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//   }
// }
// ===================OR================================

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export { asyncHandler };
// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
