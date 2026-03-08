const dynamic = async () => {
  const plugin = process.argv[2];
  if (!plugin) {
    console.error("Plugin not found");
    process.exit(1);
  }

  try {
    const module = await import(`./plugins/${plugin}.js`);
    const result = module.run();
    console.log(result);
  } catch (error) {
    console.error("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
