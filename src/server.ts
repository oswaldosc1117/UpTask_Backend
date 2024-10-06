import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db'
import { corsConfig } from './config/cors'
import AuthRoutes from './routes/AuthRoutes'
import ProjectRoutes from './routes/ProjectRoutes'

dotenv.config()

connectDB()

const app = express()

app.use(cors(corsConfig))

// Logging
app.use(morgan('dev'))

// Leer datos de formularios
app.use(express.json())

// Routes
app.use('/api/auth', AuthRoutes)
app.use('/api/projects', ProjectRoutes)

export default app