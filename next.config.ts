import type {NextConfig} from 'next';

const defaultImageHosts = [
  "picsum.photos",
  "images.unsplash.com",
  "images.stockcake.com",
  "img.freepik.com",
  "i.ibb.co",
  "s3.ap-south-1.amazonaws.com",
  "cdn-resources.highradius.com",
  "cdn.corporatefinanceinstitute.com",
  "acme.invoicehome.com",
  "hiwalk.in",
  "whitlockco.com",
  "www.dsgco.com",
];

const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const allowedImageHosts = Array.from(
  new Set([...defaultImageHosts, ...extraImageHosts])
);
const strictImageHostMode =
  process.env.NEXT_PUBLIC_STRICT_IMAGE_HOSTS === "true";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.NEXT_PUBLIC_DISABLE_IMAGE_OPTIMIZATION === "true",
    remotePatterns:
      strictImageHostMode && allowedImageHosts.length > 0
        ? allowedImageHosts.map((hostname) => ({
            protocol: "https",
            hostname,
            pathname: "/**",
          }))
        : [
            {
              protocol: "https",
              hostname: "**",
              pathname: "/**",
            },
          ],
  },
};

export default nextConfig;
