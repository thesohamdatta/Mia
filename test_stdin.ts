// Test: Can a Bun compiled binary read from stdin and write to stdout?
const input = await Bun.stdin.text();
console.log(`Received: ${input}`);
console.log('Ready for next input...');
const input2 = await Bun.stdin.text();
console.log(`Received 2: ${input2}`);
