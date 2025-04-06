import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {
    // Constructor에서 필요한 의존성을 주입받을 수 있습니다.
  }

  create(createBookDto: CreateBookDto): Promise<CreateBookDto & Book> {
    return this.booksRepository.save(createBookDto);
  }

  findOne(id: number): Promise<Book | null> {
    return this.booksRepository.findOneBy({ id });
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book | null> {
    await this.booksRepository.update(id, updateBookDto);
    return this.booksRepository.findOneBy({ id });
  }

  remove(id: number): Promise<DeleteResult> {
    return this.booksRepository.delete(+id);
  }

  async searchBooksPaginated(
    page: number,
    limit: number,
    category?: 'title' | 'author',
    keyword?: string,
  ): Promise<{
    total: number
    page: number
    totalPages: number
    books: Book[]
  }> {
    const skip = (page - 1) * limit

    // 검색 조건 조립
    const where =
      category && keyword
        ? { [category]: ILike(`%${keyword}%`) }
        : {}

    const [books, total] = await this.booksRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    })

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      books,
    }
  }
}