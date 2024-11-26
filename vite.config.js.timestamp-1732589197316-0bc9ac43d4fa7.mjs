// vite.config.js
import { defineConfig } from "file:///Users/huangjia285/projects/mpadmin/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/huangjia285/projects/mpadmin/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path2 from "path";

// plugins/obfuscator/index.ts
import { createFilter } from "file:///Users/huangjia285/projects/mpadmin/node_modules/@rollup/pluginutils/dist/es/index.js";
import Obfuscator from "file:///Users/huangjia285/projects/mpadmin/node_modules/javascript-obfuscator/dist/index.js";
function obfuscator(options = {}) {
  const { include = ["**/*.js", "**/*.ts"], exclude = ["node_modules/**"], sourceMap = true, ...obfuscatorOptions } = options;
  const filter = createFilter(include, exclude);
  return {
    name: "obfuscator",
    apply: "build",
    enforce: "post",
    transform(code, id) {
      if (!filter(id)) {
        this.debug?.(`[rollup-obfuscator] Ignoring "${id}"`);
        return null;
      }
      this.debug?.(`[rollup-obfuscator] Obfuscating "${id}"`);
      const result = Obfuscator.obfuscate(code, {
        stringArray: false,
        ...obfuscatorOptions,
        inputFileName: id,
        sourceMap
      });
      return {
        code: result.getObfuscatedCode(),
        map: sourceMap ? result.getSourceMap() : void 0
      };
    }
  };
}

// vite.config.js
import Components from "file:///Users/huangjia285/projects/mpadmin/node_modules/unplugin-vue-components/dist/vite.js";
import { AntDesignVueResolver } from "file:///Users/huangjia285/projects/mpadmin/node_modules/unplugin-vue-components/dist/resolvers.js";

// plugins/routes-generator/index.js
import fs from "fs";
import fg from "file:///Users/huangjia285/projects/mpadmin/node_modules/fast-glob/out/index.js";
import cors from "file:///Users/huangjia285/projects/mpadmin/node_modules/cors/lib/index.js";
import getEtag from "file:///Users/huangjia285/projects/mpadmin/node_modules/etag/index.js";
import chokidar from "file:///Users/huangjia285/projects/mpadmin/node_modules/chokidar/esm/index.js";
import { resolve } from "path";
import { normalizePath } from "file:///Users/huangjia285/projects/mpadmin/node_modules/vite/dist/node/index.js";
function routesGeneratorPlugin(options = {}) {
  const virtualModuleId = "virtual:router";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const layoutDir = options.layoutDir || "/src/views/Layout.vue";
  return {
    name: "routes-generator-plugin",
    // 必须的，将会在 warning 和 error 中显示
    configureServer({ middlewares, watcher, ws }) {
      middlewares.use(cors({ origin: "*" }));
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url);
        if (url.includes(virtualModuleId)) {
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Cache-Control", "no-cache");
          const content = `export default ${getCode(layoutDir)}`;
          res.setHeader("Etag", getEtag(content, { weak: true }));
          res.statusCode = 200;
          res.end(content);
        } else {
          next();
        }
      });
      const viewsWatcher = chokidar.watch("./src/views/**/*.vue", {
        ignored: /(^|[\/\\])\../,
        persistent: true
      });
      viewsWatcher.on("change", (path3) => {
        console.log(`\u6587\u4EF6 ${path3} \u5DF2\u88AB\u4FEE\u6539`);
        const content = `export default ${getCode()}`;
        ws.send({
          type: "custom",
          event: "routes-update",
          data: { content }
        });
      });
      return () => {
        viewsWatcher.close();
      };
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${getCode()}`;
      }
    }
  };
}
function getCode(layoutDir) {
  const viewsPath = "./src/views";
  let vueFiles = [];
  let dirSet = /* @__PURE__ */ new Set();
  let globs = fg.sync(`${viewsPath}/**/*.vue`, { ignore: [`${viewsPath}/*.vue`] });
  globs.forEach((f) => {
    let file = f.replace(viewsPath, "");
    vueFiles.push(file);
  });
  vueFiles = vueFiles.sort();
  let routeJson = generateRoutes(vueFiles, layoutDir);
  const routeStr = JSON.stringify(routeJson, null, "  ").replace(/"(\(\) => import\([\s\S]*?\))"/gm, "$1").replace(/"Layout"/g, "Layout");
  console.log("router has been generated.");
  return routeStr;
}
function generateRoutes(files, layoutDir) {
  let routes = [];
  let map = {};
  files.forEach((file) => {
    const fullPath = resolve("./src/views" + file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const routerRegex = /<router\s+lang="json">([\s\S]*?)<\/router>/;
    const match = content.match(routerRegex);
    if (match) {
      const routerJson = JSON.parse(match[1]);
      if (routerJson.isRouter === false) {
        return;
      }
    }
    let path3 = file.replace(".vue", "").toLowerCase();
    let parts = path3.split("/").filter(Boolean);
    let currentLevel = routes;
    let currentPath = "";
    parts.forEach((part, index) => {
      currentPath += "/" + part;
      if (!map[currentPath]) {
        let route = {
          path: currentPath,
          name: parts.slice(0, index + 1).join("-"),
          meta: { title: parts.slice(0, index + 1).join(".") + "._title" }
        };
        if (index === parts.length - 1) {
          route.component = `() => import('/src/views${file}')`;
        } else if (index === 0) {
          route.component = `() => import('/src/views/Layout.vue')`;
          route.path = "/404";
          route.children = [];
        } else {
          route.children = [];
        }
        if (index === 0) {
          currentLevel.push(route);
        } else {
          let parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
          let parent = map[parentPath];
          if (parent && parent.children) {
            parent.children.push(route);
          }
        }
        map[currentPath] = route;
        if (route.children) {
          currentLevel = route.children;
        }
      } else {
        currentLevel = map[currentPath].children || [];
        map[currentPath].children = currentLevel;
      }
    });
  });
  return routes;
}

// plugins/svg-sprite/index.js
import fs2 from "fs";
import path from "path";
import { optimize } from "file:///Users/huangjia285/projects/mpadmin/node_modules/svgo/lib/svgo-node.js";
var __vite_injected_original_dirname = "/Users/huangjia285/projects/mpadmin/plugins/svg-sprite";
function svgSpritePlugin() {
  const sourceDir = path.resolve(__vite_injected_original_dirname, "../../src/assets/icons/");
  const symbolCache = /* @__PURE__ */ new Map();
  const svgoConfig = {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false
          }
        }
      },
      "cleanupIds",
      {
        name: "removeAttrs",
        params: {
          attrs: ["class", "data-name"]
        }
      }
    ]
  };
  function convertToSymbol(content, id) {
    let processedContent = content.replace(/(fill|stroke)="([^"]+)"/g, (match, attr) => {
      if (match.includes('"none"') || !match.includes("#000000")) {
        return match;
      }
      return `${attr}="currentColor"`;
    });
    const optimizedSvg = optimize(processedContent, svgoConfig);
    return optimizedSvg.data.replace(/<svg([^>]*)>/, (match, attrs) => {
      const viewBox = attrs.match(/viewBox="([^"]*)"/);
      return `<symbol id="icon-${id}" ${viewBox ? viewBox[0] : ""}>`;
    }).replace("</svg>", "</symbol>");
  }
  function handleSvgFile(file) {
    const filePath = path.join(sourceDir, file);
    const content = fs2.readFileSync(filePath, "utf8");
    const id = path.basename(file, ".svg");
    symbolCache.set(id, convertToSymbol(content, id));
  }
  function generateSprite() {
    let spriteContent = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">';
    symbolCache.forEach((symbol) => {
      spriteContent += symbol;
    });
    spriteContent += "</svg>";
    return spriteContent;
  }
  const virtualModuleId = "virtual:svg-sprite";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  return {
    name: "svg-sprite-plugin",
    configureServer(server) {
      server.watcher.add(sourceDir);
      server.watcher.on("all", async (eventType, file) => {
        if (file.endsWith(".svg")) {
          console.log(`SVG file ${eventType}:`, file);
          if (eventType === "unlink") {
            const id = path.basename(file, ".svg");
            symbolCache.delete(id);
          }
          if (eventType === "add" || eventType === "change") {
            handleSvgFile(path.basename(file));
          }
          const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
          if (module) {
            server.moduleGraph.invalidateModule(module);
            server.ws.send({
              type: "update",
              updates: [
                {
                  type: "js-update",
                  path: resolvedVirtualModuleId,
                  acceptedPath: resolvedVirtualModuleId,
                  timestamp: Date.now()
                }
              ]
            });
            setTimeout(() => {
              server.ws.send({
                type: "full-reload"
              });
            }, 100);
          }
        }
      });
    },
    buildStart() {
      if (!fs2.existsSync(sourceDir)) {
        console.warn(`SVG source directory ${sourceDir} does not exist`);
        return;
      }
      const files = fs2.readdirSync(sourceDir);
      files.forEach((file) => {
        if (file.endsWith(".svg")) {
          handleSvgFile(file);
        }
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const spriteContent = generateSprite();
        return {
          code: `

            
            const sprite = ${JSON.stringify(spriteContent)};
            const svgElement = document.createRange().createContextualFragment(sprite).firstElementChild;
            svgElement.id = '__SVG__SPRITE__';
            document.body.appendChild(svgElement);

            // \u652F\u6301\u70ED\u66F4\u65B0
            if (import.meta.hot) {
              import.meta.hot.accept(() => {
                console.log('SVG sprite updated');
              });
            }
          `
        };
      }
    }
  };
}

// vite.config.js
var __vite_injected_original_dirname2 = "/Users/huangjia285/projects/mpadmin";
var vite_config_default = defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          return "assets/[name]-[hash].js";
        },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("ant-design-vue")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            } else if (id.includes("zxcvbn")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            } else return "mod";
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    routesGeneratorPlugin({ layoutDir: path2.resolve(process.cwd(), "/src/views/Layout.vue") }),
    svgSpritePlugin(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
          // css in js
        })
      ]
    }),
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: true,
      identifierNamesGenerator: "hexadecimal",
      log: false,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ["rc4"],
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      ignoreImports: true
    })
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname2, "./src")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
        // or "modern"
      }
    }
  },
  server: {
    proxy: {
      "/baiduapi": {
        target: "http://api.fanyi.baidu.com/api/trans/vip/translate",
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/baiduapi/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy9vYmZ1c2NhdG9yL2luZGV4LnRzIiwgInBsdWdpbnMvcm91dGVzLWdlbmVyYXRvci9pbmRleC5qcyIsICJwbHVnaW5zL3N2Zy1zcHJpdGUvaW5kZXguanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaHVhbmdqaWEyODUvcHJvamVjdHMvbXBhZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgb2JmdXNjYXRvciB9IGZyb20gJy4vcGx1Z2lucy9vYmZ1c2NhdG9yL2luZGV4J1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCB7IEFudERlc2lnblZ1ZVJlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuaW1wb3J0IHJvdXRlc0dlbmVyYXRvclBsdWdpbiBmcm9tICcuL3BsdWdpbnMvcm91dGVzLWdlbmVyYXRvcidcbmltcG9ydCBzdmdTcHJpdGVQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL3N2Zy1zcHJpdGUnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLycsXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coY2h1bmtJbmZvKVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnXG4gICAgICAgIH0sXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnYW50LWRlc2lnbi12dWUnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gaWQudG9TdHJpbmcoKS5zcGxpdCgnbm9kZV9tb2R1bGVzLycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpZC5pbmNsdWRlcygnenhjdmJuJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGlkLnRvU3RyaW5nKCkuc3BsaXQoJ25vZGVfbW9kdWxlcy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKClcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gJ21vZCdcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBpZiAoaWQuaW5jbHVkZXMoJ2xvY2FsZXMvJykpIHtcbiAgICAgICAgICAvLyAgIHJldHVybiAnbG8vJyArIGlkLnRvU3RyaW5nKCkuc3BsaXQoJ2xvY2FsZXMvJylbMV1cbiAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICByb3V0ZXNHZW5lcmF0b3JQbHVnaW4oeyBsYXlvdXREaXI6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnL3NyYy92aWV3cy9MYXlvdXQudnVlJykgfSksXG4gICAgc3ZnU3ByaXRlUGx1Z2luKCksXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgQW50RGVzaWduVnVlUmVzb2x2ZXIoe1xuICAgICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSAvLyBjc3MgaW4ganNcbiAgICAgICAgfSlcbiAgICAgIF1cbiAgICB9KSxcbiAgICBvYmZ1c2NhdG9yKHtcbiAgICAgIGNvbXBhY3Q6IHRydWUsXG4gICAgICBjb250cm9sRmxvd0ZsYXR0ZW5pbmc6IHRydWUsXG4gICAgICBjb250cm9sRmxvd0ZsYXR0ZW5pbmdUaHJlc2hvbGQ6IDAuNzUsXG4gICAgICBkZWFkQ29kZUluamVjdGlvbjogdHJ1ZSxcbiAgICAgIGRlYWRDb2RlSW5qZWN0aW9uVGhyZXNob2xkOiAwLjQsXG4gICAgICBkZWJ1Z1Byb3RlY3Rpb246IGZhbHNlLFxuICAgICAgZGVidWdQcm90ZWN0aW9uSW50ZXJ2YWw6IDAsXG4gICAgICBkaXNhYmxlQ29uc29sZU91dHB1dDogdHJ1ZSxcbiAgICAgIGlkZW50aWZpZXJOYW1lc0dlbmVyYXRvcjogJ2hleGFkZWNpbWFsJyxcbiAgICAgIGxvZzogZmFsc2UsXG4gICAgICByZW5hbWVHbG9iYWxzOiBmYWxzZSxcbiAgICAgIHJvdGF0ZVN0cmluZ0FycmF5OiB0cnVlLFxuICAgICAgc2VsZkRlZmVuZGluZzogdHJ1ZSxcbiAgICAgIHNodWZmbGVTdHJpbmdBcnJheTogdHJ1ZSxcbiAgICAgIHNwbGl0U3RyaW5nczogdHJ1ZSxcbiAgICAgIHNwbGl0U3RyaW5nc0NodW5rTGVuZ3RoOiAxMCxcbiAgICAgIHN0cmluZ0FycmF5OiB0cnVlLFxuICAgICAgc3RyaW5nQXJyYXlFbmNvZGluZzogWydyYzQnXSxcbiAgICAgIHN0cmluZ0FycmF5VGhyZXNob2xkOiAxLFxuICAgICAgdHJhbnNmb3JtT2JqZWN0S2V5czogdHJ1ZSxcbiAgICAgIHVuaWNvZGVFc2NhcGVTZXF1ZW5jZTogZmFsc2UsXG4gICAgICBpZ25vcmVJbXBvcnRzOiB0cnVlXG4gICAgfSlcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpXG4gICAgfVxuICB9LFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicgLy8gb3IgXCJtb2Rlcm5cIlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgICcvYmFpZHVhcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9hcGkuZmFueWkuYmFpZHUuY29tL2FwaS90cmFucy92aXAvdHJhbnNsYXRlJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYmFpZHVhcGkvLCAnJylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9odWFuZ2ppYTI4NS9wcm9qZWN0cy9tcGFkbWluL3BsdWdpbnMvb2JmdXNjYXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vcGx1Z2lucy9vYmZ1c2NhdG9yL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9odWFuZ2ppYTI4NS9wcm9qZWN0cy9tcGFkbWluL3BsdWdpbnMvb2JmdXNjYXRvci9pbmRleC50c1wiO2ltcG9ydCB0eXBlIHsgT2JmdXNjYXRvck9wdGlvbnMgfSBmcm9tICdqYXZhc2NyaXB0LW9iZnVzY2F0b3InXG5pbXBvcnQgdHlwZSB7IEZpbHRlclBhdHRlcm4gfSBmcm9tICdAcm9sbHVwL3BsdWdpbnV0aWxzJ1xuaW1wb3J0IHsgY3JlYXRlRmlsdGVyIH0gZnJvbSAnQHJvbGx1cC9wbHVnaW51dGlscydcbmltcG9ydCBPYmZ1c2NhdG9yIGZyb20gJ2phdmFzY3JpcHQtb2JmdXNjYXRvcidcbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAncm9sbHVwJ1xuXG5pbnRlcmZhY2UgT2JmdXNjYXRvclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIGFwcGx5PzogJ2J1aWxkJyB8ICdzZXJ2ZSdcbiAgZW5mb3JjZT86ICdwcmUnIHwgJ3Bvc3QnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm9sbHVwT2JmdXNjYXRvck9wdGlvbnMgZXh0ZW5kcyBPYmZ1c2NhdG9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBIFtGaWx0ZXJQYXR0ZXJuXShodHRwczovL2dpdGh1Yi5jb20vcm9sbHVwL3BsdWdpbnMvYmxvYi9tYXN0ZXIvcGFja2FnZXMvcGx1Z2ludXRpbHMvdHlwZXMvaW5kZXguZC50cyNMMjMpIG9mIGZpbGVzIHRvIGluY2x1ZGUuIEJ5IGRlZmF1bHQgb25seSBhbGxvd3MganMvdHMgZmlsZXMuXG4gICAqIEBkZWZhdWx0IFsnKipcXC8qLmpzJywgJyoqXFwvKi50cyddXG4gICAqL1xuICBpbmNsdWRlPzogRmlsdGVyUGF0dGVyblxuXG4gIC8qKlxuICAgKiBBIFtGaWx0ZXJQYXR0ZXJuXShodHRwczovL2dpdGh1Yi5jb20vcm9sbHVwL3BsdWdpbnMvYmxvYi9tYXN0ZXIvcGFja2FnZXMvcGx1Z2ludXRpbHMvdHlwZXMvaW5kZXguZC50cyNMMjMpIG9mIGZpbGVzIHRvIGV4Y2x1ZGUuIEJ5IGRlZmF1bHQgaWdub3JlcyBub2RlX21vZHVsZXMuXG4gICAqIEBkZWZhdWx0IFsnbm9kZV9tb2R1bGVzXFwvKionXVxuICAgKi9cbiAgZXhjbHVkZT86IEZpbHRlclBhdHRlcm5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iZnVzY2F0b3Iob3B0aW9uczogUm9sbHVwT2JmdXNjYXRvck9wdGlvbnMgPSB7fSk6IE9iZnVzY2F0b3JQbHVnaW4ge1xuICBjb25zdCB7IGluY2x1ZGUgPSBbJyoqLyouanMnLCAnKiovKi50cyddLCBleGNsdWRlID0gWydub2RlX21vZHVsZXMvKionXSwgc291cmNlTWFwID0gdHJ1ZSwgLi4ub2JmdXNjYXRvck9wdGlvbnMgfSA9IG9wdGlvbnNcblxuICBjb25zdCBmaWx0ZXIgPSBjcmVhdGVGaWx0ZXIoaW5jbHVkZSwgZXhjbHVkZSlcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvYmZ1c2NhdG9yJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBlbmZvcmNlOiAncG9zdCcsXG5cbiAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIGlmICghZmlsdGVyKGlkKSkge1xuICAgICAgICB0aGlzLmRlYnVnPy4oYFtyb2xsdXAtb2JmdXNjYXRvcl0gSWdub3JpbmcgXCIke2lkfVwiYClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cblxuICAgICAgdGhpcy5kZWJ1Zz8uKGBbcm9sbHVwLW9iZnVzY2F0b3JdIE9iZnVzY2F0aW5nIFwiJHtpZH1cImApXG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IE9iZnVzY2F0b3Iub2JmdXNjYXRlKGNvZGUsIHtcbiAgICAgICAgc3RyaW5nQXJyYXk6IGZhbHNlLFxuICAgICAgICAuLi5vYmZ1c2NhdG9yT3B0aW9ucyxcbiAgICAgICAgaW5wdXRGaWxlTmFtZTogaWQsXG4gICAgICAgIHNvdXJjZU1hcFxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogcmVzdWx0LmdldE9iZnVzY2F0ZWRDb2RlKCksXG4gICAgICAgIG1hcDogc291cmNlTWFwID8gcmVzdWx0LmdldFNvdXJjZU1hcCgpIDogdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9odWFuZ2ppYTI4NS9wcm9qZWN0cy9tcGFkbWluL3BsdWdpbnMvcm91dGVzLWdlbmVyYXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vcGx1Z2lucy9yb3V0ZXMtZ2VuZXJhdG9yL2luZGV4LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9odWFuZ2ppYTI4NS9wcm9qZWN0cy9tcGFkbWluL3BsdWdpbnMvcm91dGVzLWdlbmVyYXRvci9pbmRleC5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBmZyBmcm9tICdmYXN0LWdsb2InXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuaW1wb3J0IGdldEV0YWcgZnJvbSAnZXRhZydcbmltcG9ydCBjaG9raWRhciBmcm9tICdjaG9raWRhcidcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgbm9ybWFsaXplUGF0aCB9IGZyb20gJ3ZpdGUnXG5cbi8vIFx1NEZFRVx1NjUzOVx1NjNEMlx1NEVGNlx1NTFGRFx1NjU3MFx1NUI5QVx1NEU0OVx1RkYwQ1x1NjNBNVx1NTNEN1x1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVx1NEY1Q1x1NEUzQVx1NTNDMlx1NjU3MFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVzR2VuZXJhdG9yUGx1Z2luKG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCB2aXJ0dWFsTW9kdWxlSWQgPSAndmlydHVhbDpyb3V0ZXInXG4gIGNvbnN0IHJlc29sdmVkVmlydHVhbE1vZHVsZUlkID0gJ1xcMCcgKyB2aXJ0dWFsTW9kdWxlSWRcbiAgLy8gXHU4QkJFXHU3RjZFIGxheW91dERpciBcdTc2ODRcdTlFRDhcdThCQTRcdTUwM0NcbiAgY29uc3QgbGF5b3V0RGlyID0gb3B0aW9ucy5sYXlvdXREaXIgfHwgJy9zcmMvdmlld3MvTGF5b3V0LnZ1ZSdcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyb3V0ZXMtZ2VuZXJhdG9yLXBsdWdpbicsIC8vIFx1NUZDNVx1OTg3Qlx1NzY4NFx1RkYwQ1x1NUMwNlx1NEYxQVx1NTcyOCB3YXJuaW5nIFx1NTQ4QyBlcnJvciBcdTRFMkRcdTY2M0VcdTc5M0FcblxuICAgIGNvbmZpZ3VyZVNlcnZlcih7IG1pZGRsZXdhcmVzLCB3YXRjaGVyLCB3cyB9KSB7XG4gICAgICBtaWRkbGV3YXJlcy51c2UoY29ycyh7IG9yaWdpbjogJyonIH0pKVxuICAgICAgbWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBub3JtYWxpemVQYXRoKHJlcS51cmwpXG4gICAgICAgIGlmICh1cmwuaW5jbHVkZXModmlydHVhbE1vZHVsZUlkKSkge1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JylcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ25vLWNhY2hlJylcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gYGV4cG9ydCBkZWZhdWx0ICR7Z2V0Q29kZShsYXlvdXREaXIpfWBcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdFdGFnJywgZ2V0RXRhZyhjb250ZW50LCB7IHdlYWs6IHRydWUgfSkpXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDBcbiAgICAgICAgICByZXMuZW5kKGNvbnRlbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFx1NkRGQlx1NTJBMFx1NjU4N1x1NEVGNlx1NzZEMVx1NTQyQ1x1OTAzQlx1OEY5MVxuICAgICAgY29uc3Qgdmlld3NXYXRjaGVyID0gY2hva2lkYXIud2F0Y2goJy4vc3JjL3ZpZXdzLyoqLyoudnVlJywge1xuICAgICAgICBpZ25vcmVkOiAvKF58W1xcL1xcXFxdKVxcLi4vLFxuICAgICAgICBwZXJzaXN0ZW50OiB0cnVlXG4gICAgICB9KVxuXG4gICAgICB2aWV3c1dhdGNoZXIub24oJ2NoYW5nZScsIChwYXRoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcdTY1ODdcdTRFRjYgJHtwYXRofSBcdTVERjJcdTg4QUJcdTRGRUVcdTY1MzlgKVxuICAgICAgICBjb25zdCBjb250ZW50ID0gYGV4cG9ydCBkZWZhdWx0ICR7Z2V0Q29kZSgpfWBcbiAgICAgICAgd3Muc2VuZCh7XG4gICAgICAgICAgdHlwZTogJ2N1c3RvbScsXG4gICAgICAgICAgZXZlbnQ6ICdyb3V0ZXMtdXBkYXRlJyxcbiAgICAgICAgICBkYXRhOiB7IGNvbnRlbnQgfVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gXHU1NzI4XHU2NzBEXHU1MkExXHU1NjY4XHU1MTczXHU5NUVEXHU2NUY2XHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB2aWV3c1dhdGNoZXIuY2xvc2UoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNvbHZlSWQoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdmlydHVhbE1vZHVsZUlkKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZFxuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZChpZCkge1xuICAgICAgaWYgKGlkID09PSByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZCkge1xuICAgICAgICByZXR1cm4gYGV4cG9ydCBkZWZhdWx0ICR7Z2V0Q29kZSgpfWBcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gXHU0RkVFXHU2NTM5IGdldENvZGUgXHU1MUZEXHU2NTcwXHVGRjBDXHU0RjIwXHU1MTY1IGxheW91dERpciBcdTUzQzJcdTY1NzBcbmZ1bmN0aW9uIGdldENvZGUobGF5b3V0RGlyKSB7XG4gIGNvbnN0IHZpZXdzUGF0aCA9ICcuL3NyYy92aWV3cydcbiAgbGV0IHZ1ZUZpbGVzID0gW11cbiAgbGV0IGRpclNldCA9IG5ldyBTZXQoKVxuICBsZXQgZ2xvYnMgPSBmZy5zeW5jKGAke3ZpZXdzUGF0aH0vKiovKi52dWVgLCB7IGlnbm9yZTogW2Ake3ZpZXdzUGF0aH0vKi52dWVgXSB9KVxuICBnbG9icy5mb3JFYWNoKChmKSA9PiB7XG4gICAgbGV0IGZpbGUgPSBmLnJlcGxhY2Uodmlld3NQYXRoLCAnJylcbiAgICB2dWVGaWxlcy5wdXNoKGZpbGUpXG4gIH0pXG4gIHZ1ZUZpbGVzID0gdnVlRmlsZXMuc29ydCgpXG5cbiAgbGV0IHJvdXRlSnNvbiA9IGdlbmVyYXRlUm91dGVzKHZ1ZUZpbGVzLCBsYXlvdXREaXIpXG5cbiAgY29uc3Qgcm91dGVTdHIgPSBKU09OLnN0cmluZ2lmeShyb3V0ZUpzb24sIG51bGwsICcgICcpXG4gICAgLnJlcGxhY2UoL1wiKFxcKFxcKSA9PiBpbXBvcnRcXChbXFxzXFxTXSo/XFwpKVwiL2dtLCAnJDEnKVxuICAgIC5yZXBsYWNlKC9cIkxheW91dFwiL2csICdMYXlvdXQnKVxuICBjb25zb2xlLmxvZygncm91dGVyIGhhcyBiZWVuIGdlbmVyYXRlZC4nKVxuICByZXR1cm4gcm91dGVTdHJcbn1cblxuLy8gXHU0RkVFXHU2NTM5IGdlbmVyYXRlUm91dGVzIFx1NTFGRFx1NjU3MFx1RkYwQ1x1NjNBNVx1NTNENyBsYXlvdXREaXIgXHU1M0MyXHU2NTcwXG5mdW5jdGlvbiBnZW5lcmF0ZVJvdXRlcyhmaWxlcywgbGF5b3V0RGlyKSB7XG4gIGxldCByb3V0ZXMgPSBbXVxuICBsZXQgbWFwID0ge31cblxuICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlKCcuL3NyYy92aWV3cycgKyBmaWxlKVxuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpXG4gICAgY29uc3Qgcm91dGVyUmVnZXggPSAvPHJvdXRlclxccytsYW5nPVwianNvblwiPihbXFxzXFxTXSo/KTxcXC9yb3V0ZXI+L1xuICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChyb3V0ZXJSZWdleClcblxuICAgIGlmIChtYXRjaCkge1xuICAgICAgY29uc3Qgcm91dGVySnNvbiA9IEpTT04ucGFyc2UobWF0Y2hbMV0pXG4gICAgICBpZiAocm91dGVySnNvbi5pc1JvdXRlciA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIC8vIFx1OERGM1x1OEZDN1x1OEZEOVx1NEUyQVx1NjU4N1x1NEVGNlx1RkYwQ1x1NEUwRFx1NzUxRlx1NjIxMFx1OERFRlx1NzUzMVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwYXRoID0gZmlsZS5yZXBsYWNlKCcudnVlJywgJycpLnRvTG93ZXJDYXNlKClcbiAgICBsZXQgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG4gICAgbGV0IGN1cnJlbnRMZXZlbCA9IHJvdXRlc1xuICAgIGxldCBjdXJyZW50UGF0aCA9ICcnXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0LCBpbmRleCkgPT4ge1xuICAgICAgY3VycmVudFBhdGggKz0gJy8nICsgcGFydFxuICAgICAgaWYgKCFtYXBbY3VycmVudFBhdGhdKSB7XG4gICAgICAgIGxldCByb3V0ZSA9IHtcbiAgICAgICAgICBwYXRoOiBjdXJyZW50UGF0aCxcbiAgICAgICAgICBuYW1lOiBwYXJ0cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy0nKSxcbiAgICAgICAgICBtZXRhOiB7IHRpdGxlOiBwYXJ0cy5zbGljZSgwLCBpbmRleCArIDEpLmpvaW4oJy4nKSArICcuX3RpdGxlJyB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5kZXggPT09IHBhcnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICByb3V0ZS5jb21wb25lbnQgPSBgKCkgPT4gaW1wb3J0KCcvc3JjL3ZpZXdzJHtmaWxlfScpYFxuICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU0RjIwXHU1MTY1XHU3Njg0IGxheW91dERpciBcdTUzQzJcdTY1NzBcbiAgICAgICAgICByb3V0ZS5jb21wb25lbnQgPSBgKCkgPT4gaW1wb3J0KCcvc3JjL3ZpZXdzL0xheW91dC52dWUnKWBcbiAgICAgICAgICByb3V0ZS5wYXRoID0gJy80MDQnXG4gICAgICAgICAgcm91dGUuY2hpbGRyZW4gPSBbXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvdXRlLmNoaWxkcmVuID0gW11cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIGN1cnJlbnRMZXZlbC5wdXNoKHJvdXRlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBwYXJlbnRQYXRoID0gY3VycmVudFBhdGguc3Vic3RyaW5nKDAsIGN1cnJlbnRQYXRoLmxhc3RJbmRleE9mKCcvJykpXG4gICAgICAgICAgbGV0IHBhcmVudCA9IG1hcFtwYXJlbnRQYXRoXVxuICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaChyb3V0ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBtYXBbY3VycmVudFBhdGhdID0gcm91dGVcblxuICAgICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICBjdXJyZW50TGV2ZWwgPSByb3V0ZS5jaGlsZHJlblxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50TGV2ZWwgPSBtYXBbY3VycmVudFBhdGhdLmNoaWxkcmVuIHx8IFtdXG4gICAgICAgIG1hcFtjdXJyZW50UGF0aF0uY2hpbGRyZW4gPSBjdXJyZW50TGV2ZWxcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiByb3V0ZXNcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vcGx1Z2lucy9zdmctc3ByaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvaHVhbmdqaWEyODUvcHJvamVjdHMvbXBhZG1pbi9wbHVnaW5zL3N2Zy1zcHJpdGUvaW5kZXguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2h1YW5namlhMjg1L3Byb2plY3RzL21wYWRtaW4vcGx1Z2lucy9zdmctc3ByaXRlL2luZGV4LmpzXCI7aW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IG9wdGltaXplIH0gZnJvbSAnc3ZnbydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3ZnU3ByaXRlUGx1Z2luKCkge1xuICBjb25zdCBzb3VyY2VEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vc3JjL2Fzc2V0cy9pY29ucy8nKVxuICBjb25zdCBzeW1ib2xDYWNoZSA9IG5ldyBNYXAoKVxuXG4gIC8vIFNWR09cdTkxNERcdTdGNkVcbiAgY29uc3Qgc3Znb0NvbmZpZyA9IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdwcmVzZXQtZGVmYXVsdCcsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIG92ZXJyaWRlczoge1xuICAgICAgICAgICAgcmVtb3ZlVmlld0JveDogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnY2xlYW51cElkcycsXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdyZW1vdmVBdHRycycsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGF0dHJzOiBbJ2NsYXNzJywgJ2RhdGEtbmFtZSddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdXG4gIH1cblxuICAvLyBcdThGNkNcdTYzNjJTVkdcdTRFM0FTeW1ib2xcbiAgZnVuY3Rpb24gY29udmVydFRvU3ltYm9sKGNvbnRlbnQsIGlkKSB7XG4gICAgLy8gXHU5OTk2XHU1MTQ4XHU2NkZGXHU2MzYyXHU5ODlDXHU4MjcyXHU1QzVFXHU2MDI3XG4gICAgbGV0IHByb2Nlc3NlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhmaWxsfHN0cm9rZSk9XCIoW15cIl0rKVwiL2csIChtYXRjaCwgYXR0cikgPT4ge1xuICAgICAgLy8gXHU0RkREXHU3NTU5IG5vbmUgXHU1MDNDXHVGRjBDXHU1MTc2XHU0RUQ2XHU5ODlDXHU4MjcyXHU1MDNDXHU5MEZEXHU2NkZGXHU2MzYyXHU0RTNBIGN1cnJlbnRDb2xvclxuICAgICAgaWYgKG1hdGNoLmluY2x1ZGVzKCdcIm5vbmVcIicpIHx8ICFtYXRjaC5pbmNsdWRlcygnIzAwMDAwMCcpKSB7XG4gICAgICAgIHJldHVybiBtYXRjaFxuICAgICAgfVxuICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiY3VycmVudENvbG9yXCJgXG4gICAgfSlcblxuICAgIGNvbnN0IG9wdGltaXplZFN2ZyA9IG9wdGltaXplKHByb2Nlc3NlZENvbnRlbnQsIHN2Z29Db25maWcpXG4gICAgcmV0dXJuIG9wdGltaXplZFN2Zy5kYXRhXG4gICAgICAucmVwbGFjZSgvPHN2ZyhbXj5dKik+LywgKG1hdGNoLCBhdHRycykgPT4ge1xuICAgICAgICAvLyBcdTRGRERcdTc1NTl2aWV3Qm94XHU1QzVFXHU2MDI3XG4gICAgICAgIGNvbnN0IHZpZXdCb3ggPSBhdHRycy5tYXRjaCgvdmlld0JveD1cIihbXlwiXSopXCIvKVxuICAgICAgICByZXR1cm4gYDxzeW1ib2wgaWQ9XCJpY29uLSR7aWR9XCIgJHt2aWV3Qm94ID8gdmlld0JveFswXSA6ICcnfT5gXG4gICAgICB9KVxuICAgICAgLnJlcGxhY2UoJzwvc3ZnPicsICc8L3N5bWJvbD4nKVxuICB9XG5cbiAgLy8gXHU1OTA0XHU3NDA2XHU1MzU1XHU0RTJBU1ZHXHU2NTg3XHU0RUY2XG4gIGZ1bmN0aW9uIGhhbmRsZVN2Z0ZpbGUoZmlsZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdoYW5kbGVTdmdGaWxlJywgZmlsZSlcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihzb3VyY2VEaXIsIGZpbGUpXG4gICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKVxuICAgIGNvbnN0IGlkID0gcGF0aC5iYXNlbmFtZShmaWxlLCAnLnN2ZycpXG4gICAgc3ltYm9sQ2FjaGUuc2V0KGlkLCBjb252ZXJ0VG9TeW1ib2woY29udGVudCwgaWQpKVxuICB9XG5cbiAgLy8gXHU3NTFGXHU2MjEwU3ByaXRlXHU1MTg1XHU1QkI5XG4gIGZ1bmN0aW9uIGdlbmVyYXRlU3ByaXRlKCkge1xuICAgIGxldCBzcHJpdGVDb250ZW50ID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj4nXG4gICAgc3ltYm9sQ2FjaGUuZm9yRWFjaCgoc3ltYm9sKSA9PiB7XG4gICAgICBzcHJpdGVDb250ZW50ICs9IHN5bWJvbFxuICAgIH0pXG4gICAgc3ByaXRlQ29udGVudCArPSAnPC9zdmc+J1xuICAgIHJldHVybiBzcHJpdGVDb250ZW50XG4gIH1cblxuICAvLyBcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdJRFxuICBjb25zdCB2aXJ0dWFsTW9kdWxlSWQgPSAndmlydHVhbDpzdmctc3ByaXRlJ1xuICBjb25zdCByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZCA9ICdcXDAnICsgdmlydHVhbE1vZHVsZUlkXG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnc3ZnLXNwcml0ZS1wbHVnaW4nLFxuXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU3NkQxXHU1NDJDU1ZHXHU2NTg3XHU0RUY2XHU1M0Q4XHU1MzE2XG4gICAgICBzZXJ2ZXIud2F0Y2hlci5hZGQoc291cmNlRGlyKVxuICAgICAgc2VydmVyLndhdGNoZXIub24oJ2FsbCcsIGFzeW5jIChldmVudFR5cGUsIGZpbGUpID0+IHtcbiAgICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5zdmcnKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBTVkcgZmlsZSAke2V2ZW50VHlwZX06YCwgZmlsZSlcblxuICAgICAgICAgIC8vIFx1NkUwNVx1NzQwNlx1NjVFN1x1NzY4NFx1N0YxM1x1NUI1OFx1RkYwOFx1OTQ4OFx1NUJGOVx1OTFDRFx1NTQ3RFx1NTQwRFx1NTQ4Q1x1NTIyMFx1OTY2NFx1NzY4NFx1NjBDNVx1NTFCNVx1RkYwOVxuICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICd1bmxpbmsnKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHBhdGguYmFzZW5hbWUoZmlsZSwgJy5zdmcnKVxuICAgICAgICAgICAgc3ltYm9sQ2FjaGUuZGVsZXRlKGlkKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1NjIxNlx1NjZGNFx1NjVCMFx1N0YxM1x1NUI1OFxuICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdhZGQnIHx8IGV2ZW50VHlwZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgIGhhbmRsZVN2Z0ZpbGUocGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTkwMUFcdTc3RTVcdTVCQTJcdTYyMzdcdTdBRUZcdTZBMjFcdTU3NTdcdTY2RjRcdTY1QjBcbiAgICAgICAgICBjb25zdCBtb2R1bGUgPSBzZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZChyZXNvbHZlZFZpcnR1YWxNb2R1bGVJZClcbiAgICAgICAgICBpZiAobW9kdWxlKSB7XG4gICAgICAgICAgICBzZXJ2ZXIubW9kdWxlR3JhcGguaW52YWxpZGF0ZU1vZHVsZShtb2R1bGUpXG4gICAgICAgICAgICAvLyBcdTkwMUFcdTc3RTVcdTVCQTJcdTYyMzdcdTdBRUZcdTY2RjRcdTY1QjBcbiAgICAgICAgICAgIHNlcnZlci53cy5zZW5kKHtcbiAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgIHVwZGF0ZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnanMtdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgIHBhdGg6IHJlc29sdmVkVmlydHVhbE1vZHVsZUlkLFxuICAgICAgICAgICAgICAgICAgYWNjZXB0ZWRQYXRoOiByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZCxcbiAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU2NkY0XHU2NUIwXHU1REYyXHU1QjhDXHU2MjEwXHU1NDBFXHU1MThEXHU4OUU2XHU1M0QxXHU1QjhDXHU2NTc0XHU5MUNEXHU4RjdEXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgc2VydmVyLndzLnNlbmQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdmdWxsLXJlbG9hZCdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTZcdTY1RjZcdTU5MDRcdTc0MDZcdTYyNDBcdTY3MDlTVkdcdTY1ODdcdTRFRjZcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzb3VyY2VEaXIpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgU1ZHIHNvdXJjZSBkaXJlY3RvcnkgJHtzb3VyY2VEaXJ9IGRvZXMgbm90IGV4aXN0YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoc291cmNlRGlyKVxuICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLnN2ZycpKSB7XG4gICAgICAgICAgaGFuZGxlU3ZnRmlsZShmaWxlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICByZXNvbHZlSWQoaWQpIHtcbiAgICAgIGlmIChpZCA9PT0gdmlydHVhbE1vZHVsZUlkKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBsb2FkKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHJlc29sdmVkVmlydHVhbE1vZHVsZUlkKSB7XG4gICAgICAgIGNvbnN0IHNwcml0ZUNvbnRlbnQgPSBnZW5lcmF0ZVNwcml0ZSgpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogYFxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZSA9ICR7SlNPTi5zdHJpbmdpZnkoc3ByaXRlQ29udGVudCl9O1xuICAgICAgICAgICAgY29uc3Qgc3ZnRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHNwcml0ZSkuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICBzdmdFbGVtZW50LmlkID0gJ19fU1ZHX19TUFJJVEVfXyc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN2Z0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAvLyBcdTY1MkZcdTYzMDFcdTcwRURcdTY2RjRcdTY1QjBcbiAgICAgICAgICAgIGlmIChpbXBvcnQubWV0YS5ob3QpIHtcbiAgICAgICAgICAgICAgaW1wb3J0Lm1ldGEuaG90LmFjY2VwdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NWRyBzcHJpdGUgdXBkYXRlZCcpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlIsU0FBUyxvQkFBb0I7QUFDeFQsT0FBTyxTQUFTO0FBQ2hCLE9BQU9BLFdBQVU7OztBQ0FqQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGdCQUFnQjtBQXNCaEIsU0FBUyxXQUFXLFVBQW1DLENBQUMsR0FBcUI7QUFDbEYsUUFBTSxFQUFFLFVBQVUsQ0FBQyxXQUFXLFNBQVMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxNQUFNLEdBQUcsa0JBQWtCLElBQUk7QUFFcEgsUUFBTSxTQUFTLGFBQWEsU0FBUyxPQUFPO0FBRTVDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUVULFVBQVUsTUFBTSxJQUFJO0FBQ2xCLFVBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRztBQUNmLGFBQUssUUFBUSxpQ0FBaUMsRUFBRSxHQUFHO0FBQ25ELGVBQU87QUFBQSxNQUNUO0FBRUEsV0FBSyxRQUFRLG9DQUFvQyxFQUFFLEdBQUc7QUFFdEQsWUFBTSxTQUFTLFdBQVcsVUFBVSxNQUFNO0FBQUEsUUFDeEMsYUFBYTtBQUFBLFFBQ2IsR0FBRztBQUFBLFFBQ0gsZUFBZTtBQUFBLFFBQ2Y7QUFBQSxNQUNGLENBQUM7QUFFRCxhQUFPO0FBQUEsUUFDTCxNQUFNLE9BQU8sa0JBQWtCO0FBQUEsUUFDL0IsS0FBSyxZQUFZLE9BQU8sYUFBYSxJQUFJO0FBQUEsTUFDM0M7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOzs7QURwREEsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyw0QkFBNEI7OztBRUxxVCxPQUFPLFFBQVE7QUFDelcsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sYUFBYTtBQUNwQixPQUFPLGNBQWM7QUFDckIsU0FBUyxl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QixhQUFhO0FBQUEsTUFDYixxQkFBcUIsQ0FBQyxLQUFLO0FBQUEsTUFDM0Isc0JBQXNCO0FBQUEsTUFDdEIscUJBQXFCO0FBQUEsTUFDckIsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLQSxNQUFLLFFBQVFDLG1DQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQTtBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsYUFBYTtBQUFBLFFBQ1gsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDRCxVQUFTQSxNQUFLLFFBQVEsZUFBZSxFQUFFO0FBQUEsTUFDbkQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicGF0aCIsICJmcyIsICJmcyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIl0KfQo=
