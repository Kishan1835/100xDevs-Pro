import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node';

export const authenticateClerk = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const payload = await verifyToken(token);
        const user = await clerkClient.users.getUser(payload.sub);

        req.user = {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            role: user.publicMetadata?.role // assuming you store roles in Clerk's publicMetadata
        };

        next();
    } catch (err) {
        console.error('Clerk Auth Error:', err);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
