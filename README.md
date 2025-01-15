# Dino-management
 Ứng dụng "Dino Management" là hệ thống hỗ trợ lập trình kéo thả cho các thiết bị IoT, giúp học sinh học tập và thực hành lập trình IoT một cách trực quan, dễ dàng và hiệu quả.

## Dino Management Backend
This repository contains the backend application for the Dino Management platform, which is used for drag-and-drop Arduino IoT programming.

## Prerequisites
Before running the application, make sure you have the following installed:

Node.js: Version 14.x or higher
Docker (optional, for running with Docker)
# Getting Started 

## Clone the Repository

Clone the repository to your local machine: :shipit:

``` sh
git clone https://github.com/NguyenBaHoangKim/Dino-management.git
cd Dino-management
```

## Customize configuration

> [!NOTE]
> See [Vite Configuration Reference](https://vitejs.dev/config/).

> [!IMPORTANT]
> You need to provide a .env.dev or .env.product file for the application to work. You can create this file with the necessary environment variables such as database connection strings, API keys, etc.

## Project Setup
Install the required Node.js packages:

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Or you can run using docker

This will start both the application and the MongoDB database in separate containers.
```sh
docker-compose up -d
```

## Accessing the Application
If you're running it locally, you can access the application at http://localhost:8000.
If you're using Docker, it will also be available at the same URL (make sure to check the docker-compose.yml file for port mappings).
