import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const iti = await prisma.iTI.create({
        data: {
            Name: 'Delhi ITI',
            Region: 'North',
            Ward: 'Ward 7',
            Address: '123 Main Street',
            Contact: '01112345678',
            Status: 'Active',
            ITI_score: 95,
        },
    });

    const trade = await prisma.trade.create({
        data: {
            ITI_ID: iti.ITI_ID,
            Trade_Name: 'Electrician',
            Duration: '2 years',
            Syllabus: 'Basic and advanced electrical',
            Certification: 'NCVT',
        },
    });

    await prisma.student.create({
        data: {
            ITI_ID: iti.ITI_ID,
            Trade_ID: trade.Trade_ID,
            Name: 'Test Student',
            Batch: '2023-A',
            Year: 1,
            DOB: new Date('2002-01-15'),
            Gender: 'Male',
            Contact: 'student@example.com',
            Admission_Date: new Date('2023-08-01'),
            Placed: false,
        },
    });
}

main()
    .then(() => console.log('🌱 Seed complete'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
