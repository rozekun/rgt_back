import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Book } from '../books/entities/book.entity';
import { BooksService } from '../books/books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  providers: [SeedService ,BooksService],
})
export class SeedModule {}