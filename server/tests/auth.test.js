const assert = require('assert');
const test = require('node:test');
const AuthService = require('../src/services/authService');
const authorizeRoles = require('../src/middleware/roleMiddleware');

test('Auth API - User Registration with Hash & Token Generation', async () => {
  const newUserPayload = {
    fullName: 'Jane Developer',
    email: `jane_${Date.now()}@worksphere.io`,
    password: 'SecurePassword123!',
    role: 'Member',
    jobTitle: 'Frontend Architect',
    department: 'Engineering'
  };

  const result = await AuthService.register(newUserPayload);

  assert.ok(result.token, 'A valid JWT token should be returned upon successful registration');
  assert.strictEqual(result.user.email, newUserPayload.email.toLowerCase());
  assert.strictEqual(result.user.role, 'Member');
  assert.strictEqual(result.user.job_title, 'Frontend Architect');
});

test('Auth API - Login Credentials Authentication', async () => {
  const loginResult = await AuthService.login({
    email: 'admin@worksphere.io',
    password: 'Password123!'
  });

  assert.ok(loginResult.token, 'A valid JWT token should be returned on successful login');
  assert.strictEqual(loginResult.user.role, 'Admin');
  assert.strictEqual(loginResult.user.email, 'admin@worksphere.io');
});

test('Auth API - Reject Invalid Login Credentials', async () => {
  // Test wrong password
  try {
    await AuthService.login({
      email: 'admin@worksphere.io',
      password: 'WrongPassword999!'
    });
    assert.fail('Should have rejected wrong password');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    assert.match(err.message, /invalid email address or password/i);
  }

  // Test non-existent user email
  try {
    await AuthService.login({
      email: 'nonexistent_user_xyz@worksphere.io',
      password: 'Password123!'
    });
    assert.fail('Should have rejected non-existent user');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    assert.match(err.message, /invalid email address or password/i);
  }
});

test('Auth API - Reject Duplicate Email Registration', async () => {
  try {
    await AuthService.register({
      fullName: 'Duplicate User',
      email: 'admin@worksphere.io',
      password: 'Password123!'
    });
    assert.fail('Should have thrown duplicate email error');
  } catch (err) {
    assert.match(err.message, /already exists/i);
  }
});

test('Role Middleware - Role-Based Authorization Enforcement', () => {
  const adminMiddleware = authorizeRoles('Admin', 'Manager');

  const reqAuthorized = { user: { role: 'Admin', id: 1 } };
  const reqForbidden = { user: { role: 'Member', id: 3 } };

  let nextCalled = false;
  adminMiddleware(reqAuthorized, {}, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Admin user should be authorized');

  let forbiddenResStatus = null;
  let forbiddenResBody = null;
  const resMock = {
    status(code) {
      forbiddenResStatus = code;
      return {
        json(data) { forbiddenResBody = data; }
      };
    }
  };

  adminMiddleware(reqForbidden, resMock, () => {});
  assert.strictEqual(forbiddenResStatus, 403, 'Member user should receive 403 Forbidden');
  assert.strictEqual(forbiddenResBody.success, false);
});
