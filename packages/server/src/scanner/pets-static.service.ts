import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

/**
 * 静态资源服务 - 从本地目录读取 Spine / 图片资源
 */
@Injectable()
export class PetsStaticService {
  private readonly staticRootDir =
    process.env.STATIC_ROOT_PATH || 'D:\\petZoom\\spine-role';

  /**
   * 列出目录内的文件条目（可按关键词过滤）
   */
  async listEntries(
    query?: string,
    limit = 200,
  ): Promise<string[] | { error: string; dirPath: string; exists: boolean }> {
    if (!existsSync(this.staticRootDir)) {
      return {
        error: `目录不存在: ${this.staticRootDir}`,
        dirPath: this.staticRootDir,
        exists: false,
      };
    }

    try {
      const allFiles: string[] = [];

      const walk = async (dir: string) => {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const res = path.resolve(dir, file.name);
          if (file.isDirectory()) {
            await walk(res);
          } else {
            const relativePath = path
              .relative(this.staticRootDir, res)
              .replace(/\\/g, '/');
            allFiles.push(relativePath);
          }
        }
      };

      await walk(this.staticRootDir);

      const q = (query ?? '').trim().toLowerCase();
      const filtered = q
        ? allFiles.filter((f) => f.toLowerCase().includes(q))
        : allFiles;

      return filtered.slice(0, Math.max(1, limit));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        dirPath: this.staticRootDir,
        exists: existsSync(this.staticRootDir),
      };
    }
  }

  /**
   * 从物理目录中读取文件内容
   */
  async getFileFromZip(filePath: string): Promise<Buffer> {
    const normalizedPath = filePath.replace(/\\/g, '/');
    let fullPath = path.join(this.staticRootDir, normalizedPath);

    if (!existsSync(fullPath)) {
      const result = await this.listEntries(
        normalizedPath.split('/').pop(),
        10,
      );
      if (Array.isArray(result) && result.length > 0) {
        fullPath = path.join(this.staticRootDir, result[0]);
      }
    }

    if (!existsSync(fullPath)) {
      console.error(`[ERROR] File not found: ${fullPath}`);
      throw new NotFoundException(`文件不存在: ${filePath}`);
    }

    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error(`[ERROR] Read file failed: ${fullPath}`, error);
      throw new NotFoundException(`读取文件失败: ${filePath}`);
    }
  }

  /**
   * 获取文件的 MIME 类型
   */
  getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.json':
        return 'application/json';
      case '.atlas':
        return 'text/plain';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.spine':
        return 'application/octet-stream';
      default:
        return 'application/octet-stream';
    }
  }
}
