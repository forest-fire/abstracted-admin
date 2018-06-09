export default {
  input: "dist/esnext/index.js",
  output: [
    {
      file: "dist/abstracted-admin.cjs.js",
      format: "cjs",
      name: "AbstractedAdmin",
      sourcemap: true
    }
    // {
    //   file: "dist/abstracted-admin.umd.js",
    //   format: "umd",
    //   name: "AbstractedAdmin",
    //   sourcemap: true
    // }
  ],
  external: [
    "firebase-api-surface",
    "typed-conversions",
    "serialized-query",
    "process",
    "abstracted-firebase",
    "firebase-admin"
  ]
};
