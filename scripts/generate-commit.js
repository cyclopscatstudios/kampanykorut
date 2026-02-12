import "dotenv/config";
import { execSync } from "child_process";
import fetch from "node-fetch";

const diff = execSync("git diff --cached", { encoding: "utf8" })
  .slice(0, 8000);


const prompt = `
Generate a Conventional Commit message for this diff.
Rules:
- Use format: type(scope): description
- Be concise
- Do not exceed 72 characters in first line
- Use one of: feat, fix, refactor, test, chore

Diff:
${diff}
`;

async function run() {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a senior frontend developer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  const json = await res.json();
  console.log(json.choices[0].message.content.trim());
}

run();
