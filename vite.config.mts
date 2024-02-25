import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { mkdir, cp } from "node:fs/promises";

const relevance = 8;
const from_dates = ["2008-01-01"];
const languages = ["de", "en"];
const name = "max_mustermann";

const efp = promisify(execFile);

await Promise.all(
  from_dates.map(async from_date =>
    Promise.all(
      languages.map(async lang => {
        const recursive = { recursive: true };
        const bd = `build/profile_${lang}-${from_date}-${relevance}.docx`;
        const base = `${name}_${lang}`;
        await mkdir(bd, recursive);
        await Promise.all([
          cp("node_modules/resume-renderer/template", bd, recursive),
          efp("node", [
            "node_modules/xslt3/xslt3.js",
            "-xsl:node_modules/resume-renderer/xslt/profile2html.xsl",
            "-s:profile.xml",
            `knowledge=file:${process.cwd()}/knowledge.xml`,
            `relevance=${relevance}`,
            `lang=${lang}`,
            `from_date=${from_date}`,
            `-o:src/${base}.html`
          ]),
          efp("node", [
            "node_modules/xslt3/xslt3.js",
            "-xsl:node_modules/resume-renderer/xslt/profile2fo.xsl",
            "-s:profile.xml",
            `knowledge=file:${process.cwd()}/knowledge.xml`,
            `relevance=${relevance}`,
            `lang=${lang}`,
            `from_date=${from_date}`,
            `-o:build/profile_${lang}-${from_date}-${relevance}.fo`
          ]),
          efp("node", [
            "node_modules/xslt3/xslt3.js",
            "-xsl:node_modules/resume-renderer/xslt/profile2docx.xsl",
            "-s:profile.xml",
            `knowledge=file:${process.cwd()}/knowledge.xml`,
            `relevance=${relevance}`,
            `lang=${lang}`,
            `from_date=${from_date}`,
            `dest=${bd}`
          ])
        ]);

        await efp("fop", [
          "-fo",
          `build/profile_${lang}-${from_date}-${relevance}.fo`,
          "-pdf",
          `src/public/${base}.pdf`
        ]);

        await efp(
          "zip",
          ["-r", `../../src/public/${base}.docx`, "."],
          { cwd: bd }
        );
      })
    )
  )
);

export default defineConfig(async ({ command, mode }) => {
  return {
    base: "",
    root: "src",
    plugins: [
      compression({
        algorithm: "brotliCompress",
        exclude: [
          /\.(br)$/,
          /\.(gz)$/,
          /\.(png)$/,
          /\.(jpg)$/,
          /\.(gif)$/,
          /\.(webp)$/,
          /\.(heic)$/,
          /\.(avif)$/,
          /\.(jxl)$/,
          /\.(pdf)$/,
          /\.(docx)$/
        ],
        threshold: 500
      })
    ],
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          "src/index.html": "src/index.html",
	  ...Object.fromEntries(
            languages.map(l => [`src/${name}_${l}.html`, `src/${name}_${l}.html`])
          )

        }
      },
      sourcemap: false
    }
  };
});
