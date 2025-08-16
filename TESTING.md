# Testing Documentation

This document provides comprehensive information about the testing setup for the IIT Ropar Central Research Facilities (CRF) application.

## Overview

The application uses a comprehensive testing strategy with:
- **Server-side tests**: API endpoint testing with Jest and Supertest
- **Client-side tests**: React component testing with React Testing Library
- **Security tests**: Input validation and security utility testing
- **Integration tests**: End-to-end workflow testing
- **CI/CD pipeline**: Automated testing and deployment

## Test Structure

### Server Tests (`server/tests/`)

#### `auth.test.js`
Tests authentication endpoints and middleware:
- User login/logout functionality
- Admin authentication
- User registration
- JWT token validation
- Rate limiting
- Error handling

**Key test scenarios:**
- Valid/invalid credentials
- Missing required fields
- Network errors
- Authentication middleware
- Token expiration

#### `facilities.test.js`
Tests facility management endpoints:
- CRUD operations for facilities
- Facility bifurcations
- Special notes management
- Category management
- File upload handling

**Key test scenarios:**
- Create, read, update, delete facilities
- Bifurcation management
- Admin authorization
- Data validation
- Error responses

### Client Tests (`client/src/components/__tests__/`)

#### `Login.test.js`
Tests the Login component:
- Form rendering and validation
- User interactions
- Authentication flow
- Error handling
- Rate limiting
- Accessibility

**Key test scenarios:**
- Form field validation
- Successful/failed login attempts
- Loading states
- Navigation
- Security features

#### `AdminPanel.test.js`
Tests the Admin Panel component:
- Authentication states
- Link rendering and grouping
- User role-based access
- Navigation functionality
- Styling and layout
- Help section

**Key test scenarios:**
- Admin vs Operator views
- Link organization
- Authentication flow
- Logout functionality
- Responsive design

#### `ViewFacilitySlots.test.js`
Tests the facility slots viewing component:
- Facility loading and selection
- Weekly slots fetching
- Data display
- Error handling
- User interactions

**Key test scenarios:**
- Facility dropdown functionality
- Slot data fetching
- Time formatting
- Loading states
- Error messages

### Security Tests (`client/src/utils/__tests__/`)

#### `security.test.js`
Tests security utility functions:
- Input sanitization
- Email validation
- Password strength validation
- Phone number validation
- File validation
- Rate limiting
- Secure fetch functionality

**Key test scenarios:**
- XSS prevention
- Input validation
- Rate limiting logic
- Authentication token handling

## Running Tests

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **MySQL**: For server tests (or use Docker)
3. **Dependencies**: Install all npm packages

### Local Development

#### Server Tests
```bash
cd server
npm install
npm test              # Run tests in watch mode
npm run test:ci       # Run tests once with coverage
npm run test:coverage # Generate coverage report
```

#### Client Tests
```bash
cd client
npm install
npm test              # Run tests in watch mode
npm run test:ci       # Run tests once with coverage
npm run test:watch    # Run tests in watch mode
```

#### All Tests
```bash
# From root directory
npm run test:server   # Run server tests
npm run test:client   # Run client tests
npm run test:all      # Run all tests
```

### CI/CD Pipeline

The GitHub Actions workflow automatically runs:
1. **Server tests** with MySQL database
2. **Client tests** with React Testing Library
3. **Security audits** with npm audit and Snyk
4. **Integration tests** with live server
5. **Code quality checks** with ESLint and Prettier
6. **Performance tests**
7. **Deployment** (on main branch)

## Test Coverage

### Coverage Thresholds

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Reports

Coverage reports are generated automatically and uploaded to Codecov:
- Server coverage: `server/coverage/lcov.info`
- Client coverage: `client/coverage/lcov.info`

## Test Data and Mocking

### Database Mocking
Server tests use mocked database connections to avoid external dependencies:
```javascript
jest.mock('mysql2', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
    promise: jest.fn(() => ({ query: jest.fn() }))
  }))
}));
```

### API Mocking
Client tests mock API calls using Jest:
```javascript
jest.mock('axios');
axios.get = jest.fn();
```

### Local Storage Mocking
```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

## Testing Best Practices

### Writing Tests

1. **Arrange-Act-Assert Pattern**:
   ```javascript
   // Arrange
   const mockData = { id: 1, name: 'Test' };
   axios.get.mockResolvedValue({ data: mockData });
   
   // Act
   render(<Component />);
   
   // Assert
   expect(screen.getByText('Test')).toBeInTheDocument();
   ```

2. **Descriptive Test Names**:
   ```javascript
   it('should display error message when API call fails', async () => {
     // Test implementation
   });
   ```

3. **Test Isolation**:
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### Component Testing

1. **User-Centric Testing**:
   ```javascript
   // Good: Test user interactions
   fireEvent.click(screen.getByRole('button', { name: /login/i }));
   
   // Avoid: Testing implementation details
   expect(component.state.isLoading).toBe(true);
   ```

2. **Accessibility Testing**:
   ```javascript
   expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
   expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
   ```

### API Testing

1. **Status Code Testing**:
   ```javascript
   expect(response.status).toBe(200);
   expect(response.body).toHaveProperty('data');
   ```

2. **Error Handling**:
   ```javascript
   expect(response.status).toBe(400);
   expect(response.body).toHaveProperty('error');
   ```

## Debugging Tests

### Common Issues

1. **Async Test Failures**:
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

2. **Mock Not Working**:
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Component Not Rendering**:
   ```javascript
   // Check for missing providers
   render(
     <BrowserRouter>
       <Component />
     </BrowserRouter>
   );
   ```

### Debug Commands

```bash
# Run specific test file
npm test -- --testPathPattern=auth.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --detectOpenHandles

# Generate coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/components/Login.js"
```

## Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### Memory Leak Testing
```bash
# Run tests with memory profiling
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Security Testing

### Automated Security Checks

1. **npm audit**: Checks for known vulnerabilities
2. **Snyk**: Advanced security scanning
3. **Input validation**: Tests for XSS and injection attacks
4. **Authentication**: Tests for proper authorization

### Manual Security Testing

1. **SQL Injection**: Test with malicious input
2. **XSS**: Test with script tags
3. **CSRF**: Test with unauthorized requests
4. **Rate Limiting**: Test with excessive requests

## Continuous Integration

### GitHub Actions Workflow

The CI/CD pipeline includes:
- **Parallel test execution** for faster feedback
- **Database setup** with MySQL service
- **Security scanning** with multiple tools
- **Code quality checks** with linting
- **Coverage reporting** with Codecov
- **Deployment automation** for production

### Environment Variables

Required environment variables for testing:
```bash
# Server
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=test123
DB_NAME=test_crf_db
JWT_SECRET=test-secret-key
FRONTEND_BASE_URL=http://localhost:3000

# Client
REACT_APP_API_URL=http://localhost:5000
```

## Contributing to Tests

### Adding New Tests

1. **Follow naming convention**: `ComponentName.test.js`
2. **Group related tests**: Use `describe` blocks
3. **Test edge cases**: Include error scenarios
4. **Maintain coverage**: Aim for 70%+ coverage
5. **Update documentation**: Document new test scenarios

### Test Review Checklist

- [ ] Tests cover happy path scenarios
- [ ] Tests cover error scenarios
- [ ] Tests are isolated and independent
- [ ] Tests use descriptive names
- [ ] Tests follow AAA pattern
- [ ] Tests include accessibility checks
- [ ] Coverage meets thresholds
- [ ] No console.log statements in tests

## Troubleshooting

### Common Problems

1. **Tests failing in CI but passing locally**:
   - Check environment variables
   - Verify database connection
   - Check for timing issues

2. **Mock not working**:
   - Ensure mocks are cleared between tests
   - Check import/export paths
   - Verify mock implementation

3. **Async test timeouts**:
   - Use `waitFor` for async operations
   - Increase timeout if needed
   - Check for unhandled promises

### Getting Help

1. **Check existing tests** for similar patterns
2. **Review Jest documentation** for advanced features
3. **Check React Testing Library docs** for best practices
4. **Ask in team chat** for specific issues

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 