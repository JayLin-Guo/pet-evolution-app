import { IsString, IsNotEmpty, IsInt, MinLength, MaxLength } from 'class-validator';

export class AdoptPetDto {
  @IsInt()
  @IsNotEmpty()
  pet_egg_id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

