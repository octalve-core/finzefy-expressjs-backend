import { Sequelize } from "sequelize"

export const handleErrors = (err, req, res, next) => {
  // Log error for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  // Standard error response format
  const errorResponse = {
    result: {
      success: false,
      message: err.message || 'Internal server error',
      statusCode: err.status || 500,
      data: {}
    }
  }

  // Handle specific error types
  switch (true) {
    case err instanceof Sequelize.ValidationError:
      errorResponse.result.statusCode = 400
      errorResponse.result.message = 'Validation error'
      errorResponse.result.data = {
        errors: err.errors.map(e => e.message)
      }
      break

    case err.type === 'MethodNotAllowed':
      errorResponse.result.statusCode = 405
      break

    case err.name === 'UnauthorizedError':
      errorResponse.result.statusCode = 401
      errorResponse.result.message = 'Unauthorized access'
      break
  }

  return res.status(errorResponse.result.statusCode).json(errorResponse)
}