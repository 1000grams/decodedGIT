const assert = require('assert');
const { headers, successResponse, errorResponse } = require('../lambda/shared/cors-headers');

const data = { ok: true };
const success = successResponse(data);
assert.strictEqual(success.statusCode, 200);
assert.deepStrictEqual(success.headers, headers);
assert.strictEqual(success.body, JSON.stringify(data));

const err = new Error('oops');
const failure = errorResponse(err, 400);
assert.strictEqual(failure.statusCode, 400);
assert.deepStrictEqual(failure.headers, headers);
const parsed = JSON.parse(failure.body);
assert.strictEqual(parsed.error, err.message);
assert.ok(parsed.timestamp);

console.log('cors-headers tests passed');
