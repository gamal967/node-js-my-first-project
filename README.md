# Node.js First App

A Node.js web application built with Express.js and Pug templating engine.

## Description

This is a Node.js project featuring an MVC architecture with admin and shop functionalities.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Pug** - Template engine
- **Body-parser** - Parse incoming request bodies
- **Nodemon** - Development tool for auto-restarting

## Project Structure

```
.
├── app.js              # Main application entry point
├── controllers/        # Controller logic
├── routes/            # Route definitions
│   ├── admin.js       # Admin routes
│   └── shop.js        # Shop routes
├── views/             # Pug templates
├── public/            # Static assets
└── util/              # Utility functions
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode
```bash
npm start
```
This will start the server with nodemon on port 3000.

### Production Mode
```bash
npm run start-server
```

## Access

Open your browser and navigate to:
```
http://localhost:3000
```

## Author

Gamal

## License

ISC
