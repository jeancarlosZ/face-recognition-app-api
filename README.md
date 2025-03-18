# face-recognition-app-api

This server code along with a database handle the requests to the `Clarifai` API and manage users for the `Face-Recognition-App`.

## Getting Started

Clone this repo and run:

```bash
npm install
```

## Postgresql Installation and Activation

Install [Postgresql](https://www.postgresql.org/) and start its service. If you have [Homebrew](https://brew.sh/), you can run the following commands:

Install PostgreSQL:

```bash
brew install postgresql
```

Start PostgreSQL service:

```bash
brew services start postgresql
```

Check the status of PostgreSQL service:

```bash
brew services list
```

## Creating Local Database and Tables

Create a database with the following command:

```bash
createdb face-recognition-api
```

You can access it with:

```bash
psql face-recognition-api
```

Create the tables with the following sql commands:

```sql
CREATE TABLE users (
id serial PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email text UNIQUE NOT NULL,
entries BIGINT DEFAULT 0,
joined TIMESTAMP NOT NULL);
```

```sql
CREATE TABLE login (
id serial PRIMARY KEY,
hash varchar(100) NOT NULL,
email text UNIQUE NOT NULL);
```

## Setup .env File

Create a `.env` file in the root directory of this project. Add the following to the `.env` file:

```.env
CLARIFAI_PAT="YOUR_PAT"
DATABASE_URL="YOUR_CONNECTION_STRING"
SUPABASE_CA_CERT="CONTENTS_INSIDE_SSL_CERTIFICATE"
```

## Clarifai Account

Create a free account for [Clarifai](https://www.clarifai.com/) and get your `PAT` (Personal Access Token) that can be found in the Account's Security section of the website. Replace `YOUR_PAT` in the `.env` file with your own `PAT`.

## Supabase Account

Create a free account for [Supabase](https://supabase.com/) and create a project to get a `Connection String`. For the `Connection String`, replace `[YOUR-PASSWORD]` with the database password of your project. Replace `YOUR_CONNECTION_STRING` in the `.env` file with your own `Connection String`.

Create the database tables following the `sql` criteria from the `Creating Local Database and Tables` section above, and create access policies for them.

Toggle on `Enforce SSL on incoming connections`; this can be found in `Dashboard` ==> Click on Your Actual Project ==> Left-Hand Menu ==> Click on `Project Settings` ==> Click on `Database` ==> Scroll down to `SSL Configuration`. You can download the `SSL Certificate` underneath the toggle button. Replace `CONTENTS_INSIDE_SSL_CERTIFICATE` in the `.env` file with the certificate data inside the `SSL Certificate`.

## Choice of Supabase or Local Database

Currently `server.js` is configured with the `supabase database`. To use the `local database`, comment out the following code inside the `connection` object within the `db` variable in server.js:

```js
    connectionString: DATABASE_URL,
    ssl: { ca: CA_CERTIFICATE },
```

Also, uncomment the following:

```js
        host: "127.0.0.1",
        port: 5432,
        user: "",
        password: "",
        database: "face-recognition-api"
```

## Run Server Locally

If you want nodemon support, run:

```bash
npm run start:dev
```

Otherwise, run:

```bash
npm start
```

## Deployment

Create a free account for [Render](https://render.com/docs) and deploy with the environment variables in the `.env` file.
