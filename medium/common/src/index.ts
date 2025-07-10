import z from "zod";

export const SignUpInput = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const SignInInput = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const CreatePostInput = z.object({
    title: z.string(),
    content: z.string()
})

export const UpdatePostInput = z.object ({         
    title: z.string(),
    content: z.string(),
    id: z.string()
})

export type SignUpInput = z.infer<typeof SignUpInput>
export type SignInInput = z.infer<typeof SignInInput>
export type CreatePostInput = z.infer<typeof CreatePostInput>
export type UpdatePostInput = z.infer<typeof UpdatePostInput>
