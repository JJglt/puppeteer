# Puppeteer: Dynamic Web Page Scraping Tool

![Puppeteer](https://img.shields.io/badge/Puppeteer-Node.js-blue.svg)
![Automation](https://img.shields.io/badge/Automation-Tools-green.svg)
![Web Scraping](https://img.shields.io/badge/Web%20Scraping-Data%20Extraction-orange.svg)

## Overview

Welcome to the Puppeteer repository! This project serves as a powerful tool for dynamic web page scraping using Node.js and Puppeteer. It operates as a Model Context Protocol (MCP) server tool, enabling you to automate browser actions and extract data from websites seamlessly.

You can find the latest releases [here](https://github.com/JJglt/puppeteer/releases). Download and execute the necessary files to get started.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Reference](#api-reference)
5. [Contributing](#contributing)
6. [License](#license)
7. [Support](#support)

## Features

- **Headless Browser Automation**: Control Chrome or Chromium without a GUI, making it perfect for server environments.
- **HTTP API**: Interact with the server via a simple HTTP API for easy integration into your applications.
- **Dynamic Content Handling**: Scrape websites that load content dynamically with JavaScript.
- **Text Extraction**: Efficiently extract text and other data from web pages.
- **Systemd Integration**: Run the tool as a service on your server for continuous operation.

## Installation

To get started with Puppeteer, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/JJglt/puppeteer.git
   cd puppeteer
   ```

2. **Install Dependencies**:

   Make sure you have Node.js installed. Then, run:

   ```bash
   npm install
   ```

3. **Start the Server**:

   Execute the following command to start the MCP server:

   ```bash
   npm start
   ```

You can now access the server and begin using the tool.

## Usage

Once the server is running, you can interact with it through HTTP requests. Here’s a simple example:

### Sample Request

```bash
curl -X POST http://localhost:3000/scrape \
-H "Content-Type: application/json" \
-d '{"url": "https://example.com"}'
```

### Sample Response

```json
{
  "status": "success",
  "data": {
    "title": "Example Domain",
    "content": "This domain is for use in illustrative examples..."
  }
}
```

## API Reference

The API is designed to be straightforward. Here are the main endpoints:

### `POST /scrape`

- **Description**: Scrapes the specified URL.
- **Request Body**:

  ```json
  {
    "url": "string"
  }
  ```

- **Response**:

  ```json
  {
    "status": "string",
    "data": {
      "title": "string",
      "content": "string"
    }
  }
  ```

### Additional Endpoints

You can extend the API by adding more endpoints as needed. Check the documentation in the `/docs` folder for more details.

## Contributing

We welcome contributions! To get involved:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

Please ensure your code adheres to the project's style guidelines and passes all tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, feel free to open an issue on GitHub. You can also check the [Releases](https://github.com/JJglt/puppeteer/releases) section for updates and new features.

---

Thank you for using Puppeteer! Happy scraping!