"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Wraps async route handlers to catch errors and pass to next()
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.asyncHandler;
//# sourceMappingURL=asyncHandler.js.map