import { db } from "ponder:api";
import schema from "ponder:schema";
import { graphql } from "ponder";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors({
  origin: [
    "http://localhost:3000",
    "https://ethminorityrule-production.up.railway.app",
  ],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
}));

app.use("/graphql", graphql({ db, schema }));

export default app;
