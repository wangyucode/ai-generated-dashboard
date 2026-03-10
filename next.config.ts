import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ["knex", "better-sqlite3"],
};

export default nextConfig;
