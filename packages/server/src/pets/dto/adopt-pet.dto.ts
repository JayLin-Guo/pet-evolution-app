import {
  IsString,
  IsNotEmpty,
  IsInt,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class AdoptPetDto {
  @IsInt()
  @IsOptional()
  species_id?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
