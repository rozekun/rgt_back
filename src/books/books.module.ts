import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]), // Book 엔티티를 TypeORM 모듈에 등록
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {
}
