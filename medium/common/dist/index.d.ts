import z from "zod";
export declare const SignUpInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const SignInInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const CreatePostInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export declare const UpdatePostInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;
export type SignUpInput = z.infer<typeof SignUpInput>;
export type SignInInput = z.infer<typeof SignInInput>;
export type CreatePostInput = z.infer<typeof CreatePostInput>;
export type UpdatePostInput = z.infer<typeof UpdatePostInput>;
