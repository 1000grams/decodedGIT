const assert = require('assert');
const { headers, response, successResponse, errorResponse } = require('../lambda/shared/cors-headers');

const data = { ok: true };
const success = successResponse(data);
assert.strictEqual(success.statusCode, 200);
assert.deepStrictEqual(success.headers, headers);
assert.strictEqual(success.body, JSON.stringify(data));
assert.strictEqual(headers['Content-Type'], 'application/json');

const generic = response(201, { created: true });
assert.strictEqual(generic.statusCode, 201);
assert.deepStrictEqual(generic.headers, headers);
assert.strictEqual(generic.body, JSON.stringify({ created: true }));

const err = new Error('oops');
const failure = errorResponse(err, 400);
assert.strictEqual(failure.statusCode, 400);
assert.deepStrictEqual(failure.headers, headers);
const parsed = JSON.parse(failure.body);
assert.strictEqual(parsed.error, err.message);
assert.ok(parsed.timestamp);

console.log('cors-headers tests passed');
