// Needle Terminal UI — Sprint 0 placeholder
// TODO: Sprint 1 — ink or blessed-based TUI
export function print(msg: string): void {
  process.stdout.write(msg + "\n");
}

export function printHeader(title: string): void {
  console.log(`\nNeedle — ${title}`);
  console.log("─".repeat(40));
}

export function printError(msg: string): void {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
}

export function printSuccess(msg: string): void {
  console.log(`\x1b[32m${msg}\x1b[0m`);
}

