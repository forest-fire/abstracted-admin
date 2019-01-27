export function slashNotation(path: string) {
  return path.replace(/\./g, "/");
}

export function debug(msg: string, stack?: any[]) {
  if (process.env.DEBUG) {
    console.log(msg);
    if (stack) {
      console.log(JSON.stringify(stack));
    }
  }
}
