const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: [
            'localhost',
            'utfs.io', // UploadThing
            's3.amazonaws.com', // AWS S3
            'meditrack-reports.s3.amazonaws.com',
        ],
        unoptimized: true,
    },
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY || 'default_value',
    },
    // Enable source maps in production for better debugging
    productionBrowserSourceMaps: true,

    // Security headers
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'origin-when-cross-origin',
                },
            ],
        }, ]
    },
}

export default nextConfig