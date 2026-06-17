/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['pdfkit', 'fontkit'],
};

export default nextConfig;

