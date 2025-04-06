import { IsDate, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer'

export class CreateBookDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsString()
  author: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  stock: number;

}
