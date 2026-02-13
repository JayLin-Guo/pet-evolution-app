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
import { PetScannerService } from './pet-scanner.service';

/**
 * 静态资源控制器
 * 路由：/api/static/*
 */
@Controller('api/static')
export class PetsStaticController {
  constructor(
    private readonly staticService: PetsStaticService,
    private readonly scannerService: PetScannerService,
  ) {}

  /**
   * 触发宠物资源扫描与数据库同步
   * GET /api/static/_debug/scan
   */
  @Get('_debug/scan')
  async debugScan() {
    return this.scannerService.scanAndSync();
  }

  /**
   * 列出目录内条目
   * GET /api/static/_debug/entries?q=mon_earth_dragon_01&limit=50
   */
  @Get('_debug/entries')
  async debugEntries(@Query('q') q?: string, @Query('limit') limit?: string) {
    const lim = Number(limit ?? '200');
    const result = await this.staticService.listEntries(
      q,
      Number.isFinite(lim) ? lim : 200,
    );

    if (typeof result === 'object' && 'error' in result) {
      return result;
    }

    return result;
  }

  /**
   * 获取静态资源文件
   * GET /api/static/*filePath
   */
  @Get('*filePath')
  async getStaticFile(@Req() req: Request, @Res() res: Response) {
    try {
      const fullUrl = req.url;
      const filePath = fullUrl.replace(/^\/api\/static\//, '');

      const content = await this.staticService.getFileFromZip(filePath);
      const contentType = this.staticService.getContentType(filePath);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
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
