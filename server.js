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
mongoose.connect(MONGO_URL);

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

app.use(cors({
  origin: 'https://happiestthoughts.netlify.app', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// ----------------------
// 4. Endpoints
// ----------------------

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Happy Thoughts API!',
    endpoints: listEndpoints(app)
  })
})

app.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: 'desc' })
      .limit(20)
      .exec()
    res.status(200).json(thoughts)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch thoughts' })
  }
})

app.post('/thoughts', async (req, res) => {
  const { message } = req.body
  try {
    const newThought = new Thought({ message })
    const savedThought = await newThought.save()
    res.status(201).json(savedThought)
  } catch (err) {
    res.status(400).json({
      error: 'Could not save thought',
      details: err.errors
    })
  }
})

app.post('/thoughts/:id/like', async (req, res) => {
  try {
    const { id } = req.params

    const updatedThought = await Thought.findByIdAndUpdate(
      id,
      { $inc: { hearts: 1 } },
      { new: true } 
    )

    if (!updatedThought) {
      return res.status(404).json({ error: 'Thought not found' })
    }

    res.status(200).json(updatedThought)
  } catch (err) {
    res.status(500).json({ error: 'Could not update hearts' })
  }
})

// ----------------------
// 5. Start the Server
// ----------------------
app.listen(port, () => {
})
