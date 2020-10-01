import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
//import typescriptPlugin from "@rollup/plugin-typescript";
import autoExternal from "rollup-plugin-auto-external";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true
    }
  ],
  plugins: [
    autoExternal(),
    resolve(),
    commonjs(),
    typescriptPlugin() //{ objectHashIgnoreUnknownHack: true })
  ]
};