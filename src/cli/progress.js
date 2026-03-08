const progress = () => {
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = null;

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--duration" && i + 1 < args.length) {
      duration = parseInt(args[i + 1], 10) || 5000;
    } else if (args[i] === "--interval" && i + 1 < args.length) {
      interval = parseInt(args[i + 1], 10) || 100;
    } else if (args[i] === "--length" && i + 1 < args.length) {
      length = parseInt(args[i + 1], 10) || 30;
    } else if (args[i] === "--color" && i + 1 < args.length) {
      color = args[i + 1];
    }
  }

  let r, g, b;
  if (color && color.startsWith("#") && color.length === 7) {
    try {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        color = null;
      }
    } catch {
      color = null;
    }
  } else {
    color = null;
  }

  const startTime = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percentage = Math.min((elapsed / duration) * 100, 100);
    const filled = Math.floor((percentage / 100) * length);
    const filledChars = "█".repeat(filled);
    const emptyChars = " ".repeat(length - filled);
    let bar;
    if (color) {
      bar = `\x1b[38;2;${r};${g};${b}m${filledChars}\x1b[0m${emptyChars}`;
    } else {
      bar = filledChars + emptyChars;
    }
    process.stdout.write(`\r[${bar}] ${percentage.toFixed(0)}%`);
    if (percentage >= 100) {
      clearInterval(timer);
      console.log("\nDone!");
    }
  }, interval);
};

progress();
