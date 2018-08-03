export function slashNotation(path) {
    return path.replace(/\./g, "/");
}
export function debug(msg, stack) {
    if (process.env.DEBUG) {
        console.log(msg);
        if (stack) {
            console.log(JSON.stringify(stack));
        }
    }
}
