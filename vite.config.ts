import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { terser } from "rollup-plugin-terser";
import uglify from "@lopatnov/rollup-plugin-uglify";
import dts from "vite-plugin-dts";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],

  build: {
    sourcemap: false,
    assetsDir: "./fake",
    lib: {
      entry: "./src/useQuery.ts",
      fileName: "useQuery",
      name: "useQuery",
      formats: ["es", "cjs", "iife", "umd"],
    },

    commonjsOptions: {
      sourceMap: false,
    },

    rollupOptions: {
      external: ["react"],
      input: {
        useQuery: "./src/useQuery.ts",
      },
      output: {
        esModule: true,
        sourcemap: false,
        compact: true,
        minifyInternalExports: true,
      },
      plugins: [
        terser({
          ecma: 2020,

          mangle: { toplevel: true },

          compress: {
            module: true,
            toplevel: true,
            unsafe_arrows: true,
            drop_console: true,
            drop_debugger: true,
            ie8: false,
            unused: false,
            dead_code: false,
            ecma: 2020,
          },
          output: {
            quote_style: 1,
            braces: false,
            comments: false,
            semicolons: false,
            ie8: false,
            safari10: false,
          },
        }),
        uglify({
          compress: true,
          sourceMap: false,
        }),
      ],
    },
  },
});
