# Project Happy Thoughts API

This project is a simple REST API for storing, retrieving, and liking “Happy Thoughts”. Inspired by Twitter, but focusing on positivity. It includes endpoints to get recent thoughts, post new ones, and “like” them.

## The problem

I wanted to build an API that could integrate easily with a React frontend for a “happy thoughts” feed. The main goals were:

To practice designing a MongoDB-backed API with Mongoose models.
To handle data validation (e.g., message length limits).
To deploy the API so that it can be used in a production-like setting.
Tools & Techniques
Node.js / Express for the server.
Mongoose for modeling and validation.
MongoDB for storage (hosted on [Mongo Atlas / local / etc.]).
Heroku / Render / other for deployment.
dotenv for environment variables.
If I had more time, I would add authentication, user profiles, and more thorough error handling. I’d also consider pagination or infinite scroll to handle large numbers of thoughts.

Endpoints
GET /thoughts
Returns the 20 most recent thoughts, sorted by creation date.
POST /thoughts
Creates a new thought given a valid message.
POST /thoughts/:id/like
Increments or toggles the like count of a specific thought by ID.

## View it live

[Deployed API link](https://project-happy-thoughts-api-hc1b.onrender.com/) Click to see the available endpoints and try them out!