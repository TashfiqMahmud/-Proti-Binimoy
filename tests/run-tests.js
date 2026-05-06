const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/auth');

const createMockRequest = (headers = {}) => ({
    headers,
    header(name) {
        const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
        return key ? headers[key] : undefined;
    }
});

const createMockResponse = () => ({
    statusCode: 200,
    payload: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.payload = data;
        return this;
    }
});

let failures = 0;

const run = (name, fn) => {
    try {
        fn();
        console.log(`PASS: ${name}`);
    } catch (err) {
        failures += 1;
        console.error(`FAIL: ${name}`);
        console.error(err);
    }
};

run('auth middleware accepts Bearer token from Authorization header', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: 'user-123' }, process.env.JWT_SECRET);
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    const res = createMockResponse();
    let nextCalled = false;

    authMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 'user-123');
    assert.equal(res.statusCode, 200);
});

run('auth middleware still accepts x-auth-token header', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: 'user-legacy' }, process.env.JWT_SECRET);
    const req = createMockRequest({ 'x-auth-token': token });
    const res = createMockResponse();
    let nextCalled = false;

    authMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 'user-legacy');
    assert.equal(res.statusCode, 200);
});

run('auth middleware rejects when token is missing', () => {
    process.env.JWT_SECRET = 'test-secret';
    const req = createMockRequest();
    const res = createMockResponse();
    let nextCalled = false;

    authMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.payload, { msg: 'No token, authorization denied' });
});

run('auth middleware rejects invalid token', () => {
    process.env.JWT_SECRET = 'test-secret';
    const req = createMockRequest({ authorization: 'Bearer invalid-token' });
    const res = createMockResponse();
    let nextCalled = false;

    authMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.payload, { msg: 'Token is not valid' });
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exitCode = 1;
} else {
    console.log('\nAll tests passed.');
}
