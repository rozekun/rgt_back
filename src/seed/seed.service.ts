import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async seedBooks(count = 100) {
    const books: Partial<Book>[] = []

    for (let i = 1; i <= count; i++) {
      books.push({
        title: `샘플 책 ${i}`,
        description: `이것은 책 ${i}의 설명입니다.`,
        author: `작가 ${i % 10}`,
        image: `/uploads/books/sample_img.png`,
        stock: Math.floor(Math.random() * 10) + 1,
      })
    }

    await this.bookRepo.save(books)
    console.log(`${count}개의 책이 추가되었습니다.`)
  }
}