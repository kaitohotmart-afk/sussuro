import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
})

export const usernameSchema = z.object({
    username: z
        .string()
        .min(4, 'Username deve ter no mínimo 4 caracteres')
        .max(20, 'Username deve ter no máximo 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e underscore'),
})

export const postSchema = z.object({
    title: z
        .string()
        .min(3, 'Título deve ter no mínimo 3 caracteres')
        .max(100, 'Título deve ter no máximo 100 caracteres'),
    content: z
        .string()
        .min(10, 'Post deve ter no mínimo 10 caracteres')
        .max(5000, 'Post deve ter no máximo 5000 caracteres'),
    category: z.string().min(1, 'Selecione uma categoria'),
    is_sensitive: z.boolean().default(false),
})

export const commentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comentário não pode estar vazio')
        .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
})

export const reportSchema = z.object({
    reason: z.string().min(1, 'Selecione um motivo'),
    description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
})
