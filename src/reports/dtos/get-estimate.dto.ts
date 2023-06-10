import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsLatitude, IsLongitude, IsNumber, IsString, Max, Min } from "class-validator";


export class GetEstimateDto {
  @IsString()
  @ApiProperty({ example: 'Toyota' })
  make: string;

  @IsString()
  @ApiProperty({ example: 'Corolla' })
  model:string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1930)
  @Max(2023)
  @ApiProperty({ example: 1998 })
  year: number;

  @Transform(({ value }) => parseFloat(value))
  @IsLongitude()
  @ApiProperty({ example: 30.11111 })
  lng: number;

  @Transform(({ value }) => parseFloat(value))
  @IsLatitude()
  @ApiProperty({ example: -10.0035 })
  lat: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(500000)
  @ApiProperty({ example: 15000 })
  mileage: number;
}