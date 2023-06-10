import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReportDto {
  @IsString()
  @ApiProperty({ example: 'Toyota' })
  make: string;

  @IsString()
  @ApiProperty({ example: 'Corolla' })
  model: string;

  @IsNumber()
  @Min(1950)
  @Max(2023)
  @ApiProperty({ example: 1998 })
  year: number;

  @IsLongitude()
  @ApiProperty({ example: 30.11111 })
  lng: number;

  @IsLatitude()
  @ApiProperty({ example: -10.0035 })
  lat: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  @ApiProperty({ example: 15000 })
  mileage: number;

  @IsNumber()
  @Min(0)
  @Max(500000)
  @ApiProperty({ example: 25000 })
  price: number;
}