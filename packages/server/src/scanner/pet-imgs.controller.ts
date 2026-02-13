import { Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

/**
 * 宠物图片控制器 - 提供宠物的独立 PNG 图片
 * 路由：/api/pet-imgs/*
 *
 * 图片来源目录：D:\petZoom\imgs (本地开发) 或 STATIC_IMGS_PATH 环境变量
 */
@Controller('api/pet-imgs')
export class PetImgsController {
  private readonly imgsRootDir =
    process.env.STATIC_IMGS_PATH || 'D:\\petZoom\\imgs';

  /**
   * 获取宠物图片
   * GET /api/pet-imgs/mon_acorn_girl_01.png
   */
  @Get('*filePath')
  async getPetImage(@Req() req: Request, @Res() res: Response) {
    try {
      const fullUrl = req.url;
      const fileName = fullUrl.replace(/^\/api\/pet-imgs\//, '');

      const ext = path.extname(fileName).toLowerCase();
      if (ext !== '.png' && ext !== '.gif') {
        throw new NotFoundException(
          `Only PNG/GIF files are supported: ${fileName}`,
        );
      }

      const normalizedName = path.normalize(fileName).replace(/\\/g, '/');
      if (normalizedName.includes('..') || normalizedName.startsWith('/')) {
        throw new NotFoundException(`Invalid file path: ${fileName}`);
      }

      const fullPath = path.join(this.imgsRootDir, normalizedName);

      if (!existsSync(fullPath)) {
        throw new NotFoundException(`图片不存在: ${fileName}`);
      }

      const content = await fs.readFile(fullPath);
      const contentType = ext === '.gif' ? 'image/gif' : 'image/png';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('图片读取失败');
    }
  }
}
