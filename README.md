# Hotel Management System

A full-stack hotel management application built with ASP.NET Core and Angular.

## Project Structure

The project is organized into the following main directories:

- **client**: Angular frontend application
- **server**: ASP.NET Core backend application
- **database**: Database scripts and migrations

## Technology Stack

### Frontend
- Angular
- Angular Material
- SCSS
- i18n translation support (English and Vietnamese)

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- Clean Architecture (Core, Application, Infrastructure, API layers)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js and npm
- .NET 8 SDK
- SQL Server

### Setup and Running

#### Backend (API)
1. Navigate to the server directory
```
cd server/src/HotelManagement.API
```

2. Restore dependencies
```
dotnet restore
```

3. Run the API
```
dotnet run
```
The API will be available at https://localhost:5001 (or http://localhost:5000)

#### Frontend (Angular)
1. Navigate to the client directory
```
cd client
```

2. Install dependencies
```
npm install
```

3. Run the development server
```
npm start
```
The application will be available at http://localhost:4200

## Features

- User authentication and authorization
- Room management
- Booking system
- Multilingual support (English and Vietnamese)
- Admin dashboard
- Responsive design

## Project Architecture

### Backend Architecture
The backend follows Clean Architecture principles with the following layers:
- **Core**: Contains domain entities, interfaces, and business logic
- **Application**: Contains application services, DTOs, and use cases
- **Infrastructure**: Contains implementations of interfaces, database context, and external services
- **API**: Contains controllers, middleware, and configuration

### Frontend Architecture
The frontend is organized into the following structure:
- **components**: Reusable UI components
- **services**: Data access and business logic
- **models**: TypeScript interfaces for domain objects
- **admin**: Admin dashboard module
- **assets**: Static files (images, translations)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.