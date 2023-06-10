import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class TokenDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ0ZXNzdEB0ZXN0LmNvbSIsInJvbGUiO' })
  token: string;  
}