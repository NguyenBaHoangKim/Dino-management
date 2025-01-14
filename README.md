# Dino-management
 Ứng dụng "Dino Management" là hệ thống hỗ trợ lập trình kéo thả cho các thiết bị IoT, giúp học sinh học tập và thực hành lập trình IoT một cách trực quan, dễ dàng và hiệu quả.

## Dino Management Backend
This repository contains the backend application for the Dino Management platform, which is used for drag-and-drop Arduino IoT programming.

## Prerequisites
Before running the application, make sure you have the following installed:

Node.js: Version 14.x or higher
Docker (optional, for running with Docker)
## Getting Started
Clone the Repository
Clone the repository to your local machine:

bash
```
git clone https://github.com/NguyenBaHoangKim/Dino-management.git
cd Dino-management
```
### Install Dependencies
Install the required Node.js packages:

bash
`npm install`

### Configuration
You need to provide a .env.dev or .env.product file for the application to work. You can create this file with the necessary environment variables such as database connection strings, API keys, etc.

## Running the Application
There are two ways to run the application:

1. Using npm (Development Mode)
You can run the application in development mode with the following command:

bash
`npm run dev`
This will start the server and watch for changes.

2. Using Docker
Alternatively, you can run the application using Docker with the following command:

bash
`docker-compose up -d`
This will start both the application and the MongoDB database in separate containers.

## Accessing the Application
If you're running it locally, you can access the application at http://localhost:8000.
If you're using Docker, it will also be available at the same URL (make sure to check the docker-compose.yml file for port mappings).