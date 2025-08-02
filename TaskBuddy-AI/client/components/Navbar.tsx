'use client';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/20 text-white"
        >
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-lg font-semibold tracking-wider">🌌 Smart To-Do Assistant</h1>
                <ThemeToggle />
            </div>
        </motion.nav>
    );
}