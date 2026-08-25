import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "mysql://u297792138_amanflow:Aman%40131415@127.0.0.1:3306/u297792138_FlowDesk",
  },
});
