import readline from "readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (input) => {
    const command = input.trim();
    if (command === "uptime") {
      const uptime = process.uptime();
      console.log(`Uptime: ${uptime.toFixed(2)}s`);
    } else if (command === "cwd") {
      console.log(process.cwd());
    } else if (command === "date") {
      console.log(new Date().toISOString());
    } else if (command === "exit") {
      console.log("Goodbye!");
      rl.close();
    } else {
      console.log("Unknown command");
    }
    rl.prompt();
  });

  rl.on("SIGINT", () => {
    console.log("\nGoodbye!");
    rl.close();
  });

  rl.on("close", () => {
    process.exit(0);
  });
};

interactive();
