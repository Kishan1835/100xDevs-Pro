import express from 'express';
import prisma from '../services/db.js';
import { authenticateClerk } from '../config/clerkMiddleware.js';

const router = express.Router();

router.get('/me', authenticateClerk, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                // match Clerk ID or email (depending on how you've stored it)
                Username: req.user.email,
            },
            select: {
                User_ID: true,
                Role: true,
                ITI_ID: true,
                Last_Login: true,
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found in DB' });

        res.status(200).json({ ...user, email: req.user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
