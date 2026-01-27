import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PetsStaticService } from './pets-static.service';

/**
 * 静态资源控制器 - 从 zip 文件中读取资源
 * 路由：/api/static/*
 */
@Controller('api/static')
export class PetsStaticController {
  constructor(private readonly staticService: PetsStaticService) {}

  /**
   * 调试接口：列出 zip 内条目（只建议本地用）
   * GET /api/static/_debug/entries?q=mon_earth_dragon_01&limit=50
   */
  @Get('_debug/entries')
  async debugEntries(@Query('q') q?: string, @Query('limit') limit?: string) {
    const lim = Number(limit ?? '200');
    const result = await this.staticService.listEntries(
      q,
      Number.isFinite(lim) ? lim : 200,
    );

    // 如果返回的是错误信息，直接返回
    if (typeof result === 'object' && 'error' in result) {
      return result;
    }

    return result;
  }

  /**
   * 获取静态资源文件
   * GET /api/static/:path(*)
   */
  // Nest 11 + path-to-regexp v8：通配必须使用“命名通配”语法：/api/static/*filePath
  @Get('*filePath')
  async getStaticFile(@Req() req: Request, @Res() res: Response) {
    try {
      // 从请求 URL 中提取路径（避免 @Param 解析问题）
      const fullUrl = req.url; // 例如: /api/static/mon_earth_dragon_01/mon_earth_dragon_01_v38.json
      const filePath = fullUrl.replace(/^\/api\/static\//, ''); // 去掉前缀

      // 调试：打印实际收到的 filePath
      console.log('[DEBUG] getStaticFile - fullUrl:', fullUrl);
      console.log('[DEBUG] getStaticFile - filePath:', filePath);

      const content = await this.staticService.getFileFromZip(filePath);
      const contentType = this.staticService.getContentType(filePath);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
      res.send(content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const fullUrl = req.url || '';
      const filePath = fullUrl.replace(/^\/api\/static\//, '');
      throw new NotFoundException(
        `文件读取失败: ${filePath || '(empty path)'}`,
      );
    }
  }
}
