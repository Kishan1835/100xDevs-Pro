import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string,
  },
  Variables: {
    userId: string
  }
}>()
app.use(logger())

app.route("api/v1/user", userRouter);
app.route("api/v1/blog", blogRouter);


export default app
