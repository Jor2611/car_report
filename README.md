<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>



# Car Report app

### Prerequisites
Before running the Car Report app, make sure you have the following:
<ul>
    <li>Node.js (version 12 or higher)</li>
    <li>PostgreSQL (only for production environment, in dev and test environments app works with SQLite)</li>
</ul>

### Description

Used Car Price Estimation API with [Nest](https://github.com/nestjs/nest).

## Installation

### Local

```bash
# 1.Clone the repository
$ git clone <repository_url>

# 2.Install dependencies
$ npm install

# 3.Create environment files 
# (Create two files named .env.dev and .env.test in the root directory of the project.)
# Fill env files

PORT=3000
JWT_SECRET=thisissecret
JWT_EXPIRATION_TIME='60m'

# 4.Build app 
# (This will let generate migration files)
$ npm run build 

# 5.Generate and run migrations
# 5.1 To generate migrations, run the following command:

$ npm run typeorm migration:generate ./migrations/initial-schema -- -o -d ./src/db.datasource.ts

# 5.2 To create the necessary database tables, run the migration:
$ npm run typeorm migration:run -- -d ./src/db.datasource.ts
```

### Docker
```bash
docker run --rm -it --name=car-report-app -p 3000:3000 jorakhachatryan/car_report_app
```
attach ```sh``` at the end, to run commands inside the container manually.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Definition URL

Open in development environment http://[hostname]:[port]/api#/ (http://localhost:3000/api/#/)


## Getting Started
<ol>
  <li>Create an account:
    <ul> 
        <li> Sign up with a role of either "admin" or "user". </li>
    </ul>
  </li>
  <li>Generate reports:
    <ul> 
        <li> Once logged in, you can create reports for cars by providing various details such as make, model, year, and more.</li>
    </ul>
  </li>
  <li>Approval process:
    <ul>
      <li>If you are logged in as an admin, you can approve or reject reports created by users.</li>
    </ul>
  </li>
  <li>Estimate car prices:
      <ul>
      <li>After a report is approved, you can perform estimations to determine the price of a car based on the selected options.</li>
    </ul>
  </li>
</ol>

## License

Nest is [MIT licensed](LICENSE).
