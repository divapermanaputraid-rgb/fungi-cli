import * as readline from "node:readline/promises";

export async function promptApproval(description: string): Promise<boolean> {
  console.log(`\n⚠️  Approval needed: ${description}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question("Allow this action? [y/N]: ");
    return answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";
  } finally {
    rl.close();
  }
}
