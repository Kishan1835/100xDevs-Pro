'use client';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <Switch
                checked={theme === 'dark'}
                onCheckedChange={(val) => setTheme(val ? 'dark' : 'light')}
            />
            <Moon className="w-4 h-4" />
        </div>
    );
}