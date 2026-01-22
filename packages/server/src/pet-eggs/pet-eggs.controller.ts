import { Controller, Get, Post } from '@nestjs/common';
import { PetEggsService } from './pet-eggs.service';
import { PetEggResponseDto, DrawPetEggResponseDto } from './dto/pet-egg.dto';

@Controller('api/pet-eggs')
export class PetEggsController {
  constructor(private readonly petEggsService: PetEggsService) {}

  @Get()
  async findAll(): Promise<PetEggResponseDto[]> {
    return this.petEggsService.findAll();
  }

  @Post('draw')
  async draw(): Promise<DrawPetEggResponseDto> {
    return this.petEggsService.draw();
  }
}
