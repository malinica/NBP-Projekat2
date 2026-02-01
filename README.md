# NBP-Projekat2

## Description
The project was developed as part of the **Advanced Databases** course.  
It is a **web application for finding collaborators for projects** that allows users to create profiles, list skills, search for collaborators, and form teams.  
The application is divided into **backend** (API service in .NET) and **frontend** (user interface in React/TypeScript), with **Neo4j** main database.

## Goal
The goal of the project is to demonstrate the integration of graph databases with modern web applications through a practical team‑building scenario.  
Users can create accounts, define skills, create projects, search for people, and receive recommendations for suitable collaborators in real time.

## Features
- **User registration and login**
- **Profile management** – add skills, interests, and experience
- **Project creation** – define project details and required skills
- **Search functionality** – find people based on skills or availability
- **Recommendations** – suggest suitable candidates using graph queries
- **Team management** – add or remove members, track project progress
- **Administration** – manage users and projects

## Technologies
- **Backend**: C#/.NET 9.0, REST API  
- **Frontend**: TypeScript, React, CSS  
- **Database**: Neo4j  
- **Docker** – service orchestration  

## Running the project
1. **Navigate to the ../backend folder and run the command `docker-compose up -d`**  
2. **Navigate to the ../backend/API folder and run the command `dotnet run`**  
3. **Navigate to the ../frontend folder and run the command `npm run start`**  


