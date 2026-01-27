import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import * as yauzl from 'yauzl';

interface CachedEntry {
  fileName: string;
}

/**
 * 静态资源服务 - 从 zip 文件中读取资源
 * 用于节省 nginx 空间，将资源打包在 zip 中
 */
@Injectable()
export class PetsStaticService {
  // zip文件路径：可以通过环境变量配置
  // 默认：Linux服务器用 /var/preserve/spine-role.zip，Windows本地开发用 D:\spine-role.zip
  private readonly zipFilePath =
    process.env.STATIC_ZIP_PATH ||
    (process.platform === 'win32'
      ? 'D:\\petZoom\\spine-role.zip'
      : '/var/preserve/spine-role.zip');
  private entriesCache: Map<string, CachedEntry> | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 调试：列出 zip 内的文件条目（可按关键词过滤）
   */
  async listEntries(
    query?: string,
    limit = 200,
  ): Promise<string[] | { error: string; zipPath: string; exists: boolean }> {
    // 先检查 zip 文件是否存在
    if (!existsSync(this.zipFilePath)) {
      return {
        error: `ZIP文件不存在: ${this.zipFilePath}`,
        zipPath: this.zipFilePath,
        exists: false,
      };
    }

    try {
      await this.buildEntriesCache();
      const keys = Array.from(this.entriesCache?.keys() ?? []);
      const q = (query ?? '').trim();
      const filtered = q
        ? keys.filter((k) => k.toLowerCase().includes(q.toLowerCase()))
        : keys;
      return filtered.slice(0, Math.max(1, limit));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        zipPath: this.zipFilePath,
        exists: existsSync(this.zipFilePath),
      };
    }
  }

  /**
   * 构建 entries 缓存（只缓存文件名和位置信息，不缓存内容）
   */
  private async buildEntriesCache(): Promise<void> {
    const now = Date.now();
    if (
      this.entriesCache &&
      now - this.cacheTime < this.CACHE_TTL &&
      existsSync(this.zipFilePath)
    ) {
      return; // 缓存有效
    }

    return new Promise((resolve, reject) => {
      yauzl.open(this.zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err || !zipfile) {
          reject(
            new NotFoundException(
              `读取ZIP文件失败: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
          return;
        }

        this.entriesCache = new Map();
        zipfile.readEntry();

        zipfile.on('entry', (entry: yauzl.Entry) => {
          if (!entry.fileName.endsWith('/')) {
            // 规范化路径并存储
            const normalizedName = entry.fileName.replace(/\\/g, '/');
            this.entriesCache!.set(normalizedName, {
              fileName: entry.fileName,
            });
          }
          zipfile.readEntry();
        });

        zipfile.on('end', () => {
          this.cacheTime = Date.now();
          zipfile.close();
          resolve();
        });

        zipfile.on('error', (err) => {
          reject(
            new NotFoundException(
              `ZIP文件错误: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        });
      });
    });
  }

  /**
   * 查找匹配的 entry
   */
  private findEntry(normalizedPath: string): CachedEntry | null {
    if (!this.entriesCache) {
      return null;
    }

    // 1. 精确匹配
    if (this.entriesCache.has(normalizedPath)) {
      return this.entriesCache.get(normalizedPath)!;
    }

    // 2. 匹配完整路径（zip内可能有前缀，如 spine-role/xxx）
    for (const [key, entry] of this.entriesCache.entries()) {
      if (key.endsWith(`/${normalizedPath}`)) {
        return entry;
      }
    }

    // 3. 匹配相对路径（去掉可能的根目录前缀）
    const pathParts = normalizedPath.split('/');
    for (const [key, entry] of this.entriesCache.entries()) {
      const parts = key.split('/');
      if (parts.length >= pathParts.length) {
        const lastParts = parts.slice(-pathParts.length);
        if (lastParts.join('/') === normalizedPath) {
          return entry;
        }
      }
    }

    // 4. 最后尝试只匹配文件名
    const fileName = normalizedPath.split('/').pop();
    if (fileName) {
      for (const [key, entry] of this.entriesCache.entries()) {
        if (key.endsWith(`/${fileName}`)) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * 从 zip 文件中读取文件内容
   */
  async getFileFromZip(filePath: string): Promise<Buffer> {
    // 规范化路径
    const normalizedPath = filePath.replace(/\\/g, '/');

    // 构建 entries 缓存
    await this.buildEntriesCache();

    // 查找匹配的 entry
    const cachedEntry = this.findEntry(normalizedPath);
    if (!cachedEntry) {
      // 给出一点点"可能的匹配"提示，方便定位路径问题
      const hints = await this.listEntries(
        normalizedPath.split('/').pop() || normalizedPath,
        20,
      );
      const hintText =
        Array.isArray(hints) && hints.length > 0
          ? `; 可能相关条目: ${hints.join(', ')}`
          : '';
      // 调试：打印实际查找的路径
      console.log('[DEBUG] getFileFromZip - normalizedPath:', normalizedPath);
      console.log('[DEBUG] getFileFromZip - filePath:', filePath);

      throw new NotFoundException(
        `文件不存在于ZIP中: ${normalizedPath} (原始路径: ${filePath}, ZIP路径: ${this.zipFilePath})${hintText}`,
      );
    }

    // 打开 zip 文件并读取内容
    return new Promise((resolve, reject) => {
      yauzl.open(this.zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err || !zipfile) {
          reject(
            new NotFoundException(
              `读取ZIP文件失败: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
          return;
        }

        // 找到对应的 entry
        zipfile.readEntry();
        zipfile.on('entry', (entry: yauzl.Entry) => {
          if (entry.fileName === cachedEntry.fileName) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err || !readStream) {
                reject(
                  new NotFoundException(
                    `读取文件失败: ${err instanceof Error ? err.message : String(err)}`,
                  ),
                );
                zipfile.close();
                return;
              }

              const chunks: Buffer[] = [];
              readStream.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
              });
              readStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                zipfile.close();
                resolve(buffer);
              });
              readStream.on('error', (err) => {
                zipfile.close();
                reject(
                  new NotFoundException(
                    `读取文件流失败: ${err instanceof Error ? err.message : String(err)}`,
                  ),
                );
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          reject(
            new NotFoundException(
              `文件不存在于ZIP中: ${filePath} (ZIP路径: ${this.zipFilePath})`,
            ),
          );
        });

        zipfile.on('error', (err) => {
          reject(
            new NotFoundException(
              `ZIP文件错误: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        });
      });
    });
  }

  /**
   * 获取文件的 MIME 类型
   */
  getContentType(filePath: string): string {
    if (filePath.endsWith('.json')) {
      return 'application/json';
    }
    if (filePath.endsWith('.atlas')) {
      return 'text/plain';
    }
    if (filePath.endsWith('.png')) {
      return 'image/png';
    }
    return 'application/octet-stream';
  }
}
