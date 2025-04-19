# Coding Standards and Rules

This document outlines the coding standards and rules for the Hotel Management System project. All contributors should adhere to these guidelines to maintain consistency and code quality.

## General Rules

- Use English for code, comments, documentation, and commit messages
- Follow the DRY (Don't Repeat Yourself) principle
- Keep files focused on a single responsibility
- Write self-documenting code with descriptive variable and function names
- Use consistent indentation (2 spaces for frontend, 4 spaces for backend)
- Maximum line length: 120 characters
- Add TODO comments for incomplete code sections with a brief explanation
- Document all public APIs

## Git Workflow

- Use feature branches for development
- Branch naming convention: `feature/feature-name`, `bugfix/bug-name`, `hotfix/fix-name`
- Write meaningful commit messages with a verb in the imperative mood (e.g., "Add user authentication")
- Make small, focused commits
- Pull and rebase before pushing to ensure clean merge history
- Resolve merge conflicts promptly

## Backend (C# / ASP.NET Core)

### Architecture
- Maintain the Clean Architecture pattern
- Follow SOLID principles
- Use dependency injection wherever possible
- Separate business logic from controllers
- Put business logic in Application layer services
- Keep controllers thin

### Code Style
- Use PascalCase for class names, method names, and property names
- Use camelCase for local variables and parameters
- Use UPPER_SNAKE_CASE for constants
- Prefix interfaces with 'I' (e.g., IUserRepository)
- Prefix private fields with underscore (e.g., _userRepository)
- Use expression-bodied members for simple methods and properties
- Add XML documentation comments for public APIs

### API Design
- Use RESTful conventions
- Use appropriate HTTP status codes
- Version your APIs (e.g., v1, v2)
- Use DTOs for request/response objects
- Implement proper model validation
- Return consistent response formats
- Use asynchronous methods with Task/Task<T> returns

### Data Access
- Use Entity Framework Core for data access
- Define explicit relationships between entities
- Use migrations for database schema changes
- Don't expose entities directly to API consumers
- Use repository pattern for data access abstraction
- Implement proper error handling for database operations

## Frontend (Angular / TypeScript)

### Architecture
- Follow Angular best practices and style guide
- Use the NgModules pattern
- Lazy load feature modules
- Use feature-based folder structure
- Separate concerns (components, services, models, etc.)
- Use state management for complex applications

### Code Style
- Use PascalCase for class names and interfaces
- Use camelCase for variables, properties, and methods
- Use kebab-case for file names and directory names
- Use camelCase for component selectors
- Add component prefix 'app-' or 'hotel-' for component selectors
- Use template strings for multiline strings
- Use typed variables and function parameters

### Component Design
- Keep components small and focused
- Use smart (container) and presentational components pattern
- Use @Input() and @Output() for component communication
- Implement OnPush change detection where appropriate
- Follow consistent component file structure:
  - Component class
  - Component template
  - Component styles
  - Component tests

### Styling
- Use SCSS for styling
- Use BEM (Block Element Modifier) methodology for CSS class naming
- Use variables for colors, fonts, and other repeated values
- Implement responsive design using Angular Material breakpoints
- Minimize global styles

### Angular Material
- Use Angular Material components consistently
- Maintain a unified design system
- Create a custom theme
- Use Material CDK for custom component development

### Testing
- Write unit tests for services and components
- Write integration tests for complex workflows
- Keep test files adjacent to the code being tested
- Mock external dependencies
- Aim for high test coverage

## Security

- Never store sensitive information in client-side code
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all user inputs
- Protect against common web vulnerabilities (XSS, CSRF, SQL Injection)
- Use HTTPS in all environments
- Keep dependencies updated

## Performance

### Backend
- Use asynchronous programming for I/O operations
- Implement proper caching strategies
- Optimize database queries
- Use pagination for large data sets
- Monitor performance with appropriate tools

### Frontend
- Lazy load modules and components
- Optimize images and assets
- Use Virtual Scrolling for long lists
- Implement proper unsubscription from observables
- Avoid memory leaks

## Accessibility

- Follow WCAG 2.1 AA standards
- Use semantic HTML
- Implement proper keyboard navigation
- Provide alternative text for images
- Ensure sufficient color contrast
- Test with screen readers

## Internationalization

- Use i18n for all user-facing text
- Keep translations in separate files
- Use proper date, number, and currency formatting
- Support right-to-left languages if needed
- Test with different languages

## Documentation

- Maintain up-to-date project README
- Document API endpoints
- Document project architecture
- Include setup instructions
- Document build and deployment procedures

## Code Review

- All code must be reviewed before merging
- Address all review comments
- Check for adherence to coding standards
- Verify all tests pass
- Ensure documentation is updated