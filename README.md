# Coding Challenge Scalapay

RESTful API built with NestJS for e-commerce product management, following the directives of the coding assignment.

## Prerequisites

- Node.js (version 18 or higher)
- npm
- Docker and Docker Compose

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Emi-dev28/scalapay_coding_assignment
cd coding_challenge_scalapay
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.template .env
```
Edit the `.env` file with your local configurations if needed.

## Database Setup

Start the MySQL database using Docker Compose:

```bash
docker-compose up -d
```

## Running the Application

### Development Mode

To run the application in development mode with hot reload:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run end-to-end tests

```bash
npm run test:e2e
```

### Generate coverage report

```bash
npm run test:cov
```

The coverage report will be generated in the `./coverage` folder. You can view the HTML report by opening `./coverage/lcov-report/index.html` in your browser.

## Notes

- Ensure port 3000 is available before running the application
- Port 3306 must be available for the MySQL database
- Database data is persisted in the `./mysql-data` volume
- Architecture Decision: The specification mentions implementing a microservice in item 2, but the current implementation follows a monolithic REST API approach, which better fits the requirements. If microservice architecture is preferred, this can be easily modified in `main.ts`: 
```
app.connectMicroservice({
    transport: WebTransport.TCP // or NATS, etc
    options: {
      host: <HOST>,
      port: <port>
    }
```
This would require installing `@nestjs/microservices` package