import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string,
  }
}>()
app.use(logger())

app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        post: ""
      }
    });
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ jwt })

  } catch (e) {
    return c.status(403);
  }
})

app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const id = c.req.param('id')

  const body = await c.req.json()
  const user = prisma.user.findMany({
    where: {
      email: body.email
    }
  })
  if (!user) {
    c.status(403)
    return c.json({ error: "user not found" })
  }
  const jwt = await sign({ id: id }, c.env.JWT_SECRET)
  return c.text("SignIn route")
})

app.get("/api/v1/blog/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const id = c.req.param('id')

  const post = await prisma.post.findMany({
    where: {
      authorId: id
    }
  })

  if (!post) {
    c.status(404)
    return c.json({ error: "blog not found" })
  }
  return c.json(post)
})

app.post('/api/v1/blog', (c) => {
  return c.text("blog")
})

app.put('/api/v1/blog', (c) => {
  return c.text("put blog")
})


export default app
