import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { SignUpInput, SignInInput } from "@tskishan3000/medium-post-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string,
    }
}>()

userRouter.post('/signup', async (c) => {
    const body = await c.req.json()
    const { success } = SignUpInput.safeParse(body)

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

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
        console.error(e); // Add this line
        return c.json({ error: "User creation failed" }, 403);
    }
})


userRouter.post('/signin', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { success } = SignInInput.safeParse(body)

    if (!success) {
        c.status(411)
        return c.json({ message: "Inputs not correct" })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password
            }
        })
        if (!user) {
            c.status(403)//unauthorized
            return c.json({ error: "incorrect creds" })
        }

        const jwt = await sign({ id: id }, c.env.JWT_SECRET)
        return c.json({ jwt: jwt })

    } catch (e) {
        console.log(e)
        c.status(411)
        return c.text('Invalid')
    }
})
