// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // НЕ используй output: 'export' если нужны API маршруты
  images: {
    unoptimized: true,
  },
};

export default nextConfig;