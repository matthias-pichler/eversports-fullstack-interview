import type { ErrorRequestHandler } from "express";
import { ValidationError } from "./modern/errors";
import { StatusCodes } from "http-status-codes";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	console.error(err.stack);

	if (err instanceof ValidationError) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: err.message,
		});
	}

	res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
		error: "Internal Server Error",
		message: err.message,
	});
};
