import jwt from 'jsonwebtoken';
import prisma from '../services/db.js';

export const studentLogin = async (req, res) => {
    try {
        const { email, dob } = req.body;
        if (!email || !dob) return res.status(400).json({ error: 'Email and DOB are required.' });

        const student = await prisma.student.findFirst({
            where: {
                Contact: email,
                DOB: new Date(dob)
            }
        });

        if (!student) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: student.Student_ID, itiId: student.ITI_ID, role: 'STUDENT' },
            process.env.JWT_SECRET,
            { expiresIn: '2d' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
