import pkg from "./package.json";
import typescript from "rollup-plugin-typescript2";

const input = ["./index.ts"];
export default [
  // ESM and CJS
  {
    input,
    plugins: [
      typescript({
        typescript: require("typescript"),
      }),
    ],
    output: [
      {
        dir: "dist/esm",
        format: "esm",
        exports: "named",
        sourcemap: true,
      },
      {
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
    external: [...Object.keys(pkg.peerDependencies || {})],
  },
];

// import { nodeResolve } from "@rollup/plugin-node-resolve";
// import { terser } from "rollup-plugin-terser";
// import babel from "@rollup/plugin-babel";
// nodeResolve(),
// commonjs(), // prise en charge de require
// babel({ babelHelpers: "bundled" }), // transpilation
