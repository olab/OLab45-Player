import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { transformAsync } from "@babel/core";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url)),
);

// the dependency scanner uses plain esbuild, which can't parse Flow annotations
const flowStripForScan = {
  name: "flow-strip-for-scan",
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/].*\.js$/ }, async (args) => {
      const source = await readFile(args.path, "utf8");
      if (!source.includes("@flow")) {
        return null;
      }
      const result = await transformAsync(source, {
        filename: args.path,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["jsx"] },
        plugins: ["@babel/plugin-transform-flow-strip-types"],
      });
      return { contents: result.code, loader: "jsx" };
    });
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const publicUrl = (env.VITE_PUBLIC_URL || "").replace(/\/$/, "");

  return {
    base: `${publicUrl}/`,
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
    },
    plugins: [
      react({
        include: /\.(js|jsx)$/,
        babel: { plugins: ["@babel/plugin-transform-flow-strip-types"] },
      }),
      svgr(),
    ],
    // the sources contain JSX in .js files
    esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
    optimizeDeps: {
      entries: ["index.html"],
      esbuildOptions: {
        loader: { ".js": "jsx" },
        plugins: [flowStripForScan],
      },
    },
    server: { port: 3000 },
    build: {
      outDir: "build",
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: "static/js/[name]-[hash].js",
          chunkFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/media/[name]-[hash][extname]",
        },
      },
    },
  };
});
