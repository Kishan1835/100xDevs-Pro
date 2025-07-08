import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { PrismaClient } from './generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt } from 'hono/jwt'




const app = new Hono()
app.use(logger())

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  }
}>();

app.post('/api/v1/signuo', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body = c.req.json()
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    });

    return c.text('jwt here')
  } catch (e) {
    return c.status(403);
  }
})

app.post('/api/v1/signin', (c) => {
  return c.text("SignIn route")
})

app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param('id')
  // return c.text(id);
  return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {
  return c.text("blog")
})

app.put('/api/v1/blog', (c) => {
  return c.text("put blog")
})


export default app
