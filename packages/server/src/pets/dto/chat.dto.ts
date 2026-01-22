import { IsString, IsNotEmpty } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatResponseDto {
  reply: string;
  statusUpdate?: {
    happiness?: number;
    exp?: number;
  };
}

