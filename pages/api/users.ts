import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

function buildUsersTs(users: any[]): string {
  const header = `export interface User {\n  id: number;\n  name: string;\n  email: string;\n  role: \"Admin\" | \"User\" | \"Manager\";\n  status: \"Active\" | \"Inactive\" | \"Pending\";\n  age: number;\n  created_at: string; // ISO date (YYYY-MM-DD)\n}\n\n`;
  const body = `export const users: User[] = [\n${users
    .map(
      (u) =>
        `  { id: ${u.id}, name: ${JSON.stringify(u.name)}, email: ${JSON.stringify(u.email)}, role: ${JSON.stringify(u.role)}, status: ${JSON.stringify(u.status)}, age: ${u.age}, created_at: ${JSON.stringify(u.created_at)} }`
    )
    .join(",\n")}\n];\n`;
  return header + body;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE" && req.method !== "POST" && req.method !== "PUT") {
    res.setHeader("Allow", ["DELETE", "POST", "PUT"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const usersFile = path.join(process.cwd(), "data", "users.ts");
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(usersFile, "utf-8");
  } catch (e) {
    return res.status(500).json({ error: "Failed to read users.ts" });
  }

  let currentUsers: any[] = [];
  try {
    const match = fileContent.match(/export const users:\s*User\[\]\s*=\s*\[(.|\n|\r)*\];/);
    if (!match) throw new Error("users array not found");
    const arrayText = match[0]
      .replace(/^.*=\s*\[/, "[")
      .replace(/\];\s*$/, "]");
    currentUsers = Function("return " + arrayText)();
  } catch (e) {
    return res.status(500).json({ error: "Failed to parse users.ts" });
  }

  if (req.method === "DELETE") {
    const idParam = req.query.id;
    const id = Array.isArray(idParam) ? Number(idParam[0]) : Number(idParam);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: "Missing or invalid id" });

    const nextUsers = currentUsers.filter((u) => Number(u.id) !== id);
    if (nextUsers.length === currentUsers.length) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      fs.writeFileSync(usersFile, buildUsersTs(nextUsers), "utf-8");
    } catch (e) {
      return res.status(500).json({ error: "Failed to write users.ts" });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const required = ["name", "email", "role", "status", "age", "created_at"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return res.status(400).json({ error: `Missing field: ${k}` });
      }
    }

    const maxId = currentUsers.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
    const newUser = {
      id: maxId + 1,
      name: String(body.name),
      email: String(body.email),
      role: String(body.role),
      status: String(body.status),
      age: Number(body.age),
      created_at: String(body.created_at),
    };

    const nextUsers = [...currentUsers, newUser];

    try {
      fs.writeFileSync(usersFile, buildUsersTs(nextUsers), "utf-8");
    } catch (e) {
      return res.status(500).json({ error: "Failed to write users.ts" });
    }

    return res.status(201).json({ ok: true, user: newUser });
  }

  if (req.method === "PUT") {
    const idParam = req.query.id;
    const id = Array.isArray(idParam) ? Number(idParam[0]) : Number(idParam);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: "Missing or invalid id" });

    const body = req.body || {};
    const required = ["name", "email", "role", "status", "age", "created_at"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return res.status(400).json({ error: `Missing field: ${k}` });
      }
    }

    const userIndex = currentUsers.findIndex((u) => Number(u.id) === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = {
      id,
      name: String(body.name),
      email: String(body.email),
      role: String(body.role),
      status: String(body.status),
      age: Number(body.age),
      created_at: String(body.created_at),
    };

    const nextUsers = [...currentUsers];
    nextUsers[userIndex] = updatedUser;

    try {
      fs.writeFileSync(usersFile, buildUsersTs(nextUsers), "utf-8");
    } catch (e) {
      return res.status(500).json({ error: "Failed to write users.ts" });
    }

    return res.status(200).json({ ok: true, user: updatedUser });
  }
}
