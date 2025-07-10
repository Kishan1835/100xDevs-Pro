import { Hono } from "hono"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { CreatePostInput, UpdatePostInput } from "@tskishan3000/medium-post-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string,
    },
    Variables: {
        userId: string
    }
}>()

blogRouter.use('/*', async (c, next) => {

    const authHeader = c.req.header("authorization") || "";
    // const token = authHeader.split(" ")[1];
    try {
        const response = await verify(authHeader, c.env.JWT_SECRET)
        if (response) {
            c.set("userId", String(response.id))
            await next();
        } else {
            c.status(403)
            return c.json({
                meaaage: "You are not logged In"
            })
        }
    } catch (e) {
        c.status(403)
        return c.json({
            meaaage: "You are not logged In"
        })
    }
})



blogRouter.post('/', async (c) => {
    const body = await c.req.json()
    const { success } = CreatePostInput.safeParse(body)
    if (!success) {
        c.status(411)
        return c.json({
            messafe: "Inputs are not correct"
        })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: String(authorId)
        }
    })
    return c.json({
        id: post.id

    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json()
    const { success } = UpdatePostInput.safeParse(body)
    if (!success) {
        c.status(411)
        return c.json({
            messafe: "Inputs are not correct"
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const post = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content
        }
    })
    return c.json({
        id: post.id

    })
})

// adding Todo
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.post.findMany()

    return c.json({
        blogs
    })
})


blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: String(id)
            }
        })
        return c.json({
            blog
        })
    } catch (e) {
        c.status(411)
        return c.json({
            message: "post doest exists"
        })
    }
})

