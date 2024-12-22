import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'

dotenv.config()

// ----------------------
// 1. Mongoose Connection
// ----------------------
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1/happy-thoughts'
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB successfully!')
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
  })

// ----------------------
// 2. Mongoose Model
// ----------------------
const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  // Example array of user references who have “liked” this thought
  likedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: () => new Date()
  }
})

const Thought = mongoose.model('Thought', ThoughtSchema)

// ----------------------
// 3. Express App Setup
// ----------------------
const app = express()
const port = process.env.PORT || 8080

// Middlewares
app.use(cors({
  origin: 'https://my-happy-thoughts-frontend.netlify.app', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// ----------------------
// 4. Endpoints
// ----------------------

// Root endpoint - shows available endpoints in JSON
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Happy Thoughts API!',
    endpoints: listEndpoints(app)
  })
})

// GET /thoughts - Return up to 20 thoughts, sorted by date (descending)
app.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: 'desc' })
      .limit(20)
      .exec()
    res.status(200).json(thoughts)
  } catch (err) {
    console.error('Error fetching thoughts:', err)
    res.status(500).json({ error: 'Could not fetch thoughts' })
  }
})

// POST /thoughts - Create a new thought
app.post('/thoughts', async (req, res) => {
  const { message } = req.body

  try {
    const newThought = new Thought({ message })
    const savedThought = await newThought.save()
    res.status(201).json(savedThought)
  } catch (err) {
    console.error('Error creating new thought:', err)
    res.status(400).json({
      error: 'Could not save thought',
      details: err.errors
    })
  }
})

// POST /thoughts/:id/like - Toggle hearts for a given thought
app.post('/thoughts/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const thought = await Thought.findById(id)

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' })
    }

    // Example toggle logic: if hearts is even, increment, otherwise decrement
    if (thought.hearts % 2 === 0) {
      thought.hearts += 1
    } else {
      thought.hearts -= 1
    }

    const updatedThought = await thought.save()
    res.status(200).json(updatedThought)
  } catch (err) {
    console.error('Error liking the thought:', err)
    res.status(500).json({ error: 'Could not update hearts' })
  }
})

// ----------------------
// 5. Start the Server
// ----------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
