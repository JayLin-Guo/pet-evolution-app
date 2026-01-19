const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 配置 monorepo 支持
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 添加 Spine 相关的文件扩展名
config.resolver.assetExts.push("json", "atlas", "skel");

// 配置服务器中间件来托管 assets 文件夹
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // 处理 /assets/ 路径的请求
      if (req.url.startsWith("/assets/")) {
        const filePath = path.join(__dirname, req.url.split("?")[0]);

        // 检查文件是否存在
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();

          // 设置正确的 Content-Type
          const contentTypes = {
            ".json": "application/json",
            ".atlas": "text/plain",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".skel": "application/octet-stream",
          };

          const contentType = contentTypes[ext] || "application/octet-stream";
          res.setHeader("Content-Type", contentType);
          res.setHeader("Access-Control-Allow-Origin", "*");

          // 读取并返回文件
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
          return;
        }
      }

      // 如果不是 assets 请求或文件不存在，继续正常流程
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
