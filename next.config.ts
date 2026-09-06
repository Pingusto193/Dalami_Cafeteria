import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Quando o StorageAdapter de produção entrar (Cloudinary / S3 / R2 / Supabase),
    // adicione o host aqui. Em dev as imagens são servidas localmente, sem host remoto.
    remotePatterns: [],
  },
};

export default nextConfig;
