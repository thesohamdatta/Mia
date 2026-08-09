// Test AskUserQuestion pattern - read from stdin, write to stdout
console.log('Question: What is your name?');
const name = await Bun.stdin.text();
console.log(`Hello, ${name.trim()}!`);

console.log('\nQuestion: What is your goal?');
const goal = await Bun.stdin.text();
console.log(`Goal recorded: ${goal.trim()}`);
