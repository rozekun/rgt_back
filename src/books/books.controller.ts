import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException, Put,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Express } from 'express';
import { Query } from '@nestjs/common';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {
  }

// POST 요청을 처리하는 핸들러 (책 생성)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      // 업로드된 파일이 저장될 디렉토리 설정 (서버 내부 경로)
      destination: './uploads/books',

      // 저장될 파일명 설정: "image-1687256381234-123456789.jpg" 같은 형식
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname); // 원래 파일의 확장자 추출 (.jpg, .png 등)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // 최종 파일명 생성
      },
    }),
  }))
  async create(
    // 프론트에서 전송된 이미지 파일을 받음
    @UploadedFile() file: Express.Multer.File,
    // 나머지 폼 데이터(title, author, description 등)를 body에서 받음
    @Body() body: Partial<CreateBookDto>, //Partial로라도 타입을 정확히 정의하고 밑에서 따로 검증할예정
  ) {
    // 업로드된 이미지 파일명으로 URL 생성 (DB에 저장할 문자열)
    const imageUrl = `/uploads/books/${file.filename}`;

    //  바디 + 서버 값 조합해서 완성된 DTO 생성 , 일단 plain object
    const fullBody = {
      ...body,
      image: imageUrl,
    };
    //  CreateBookDto 타입으로 변환
    const createBookDto = plainToInstance(CreateBookDto, fullBody);
    //객체 리터럴 → 클래스 인스턴스
    //class-validator는 클래스 인스턴스에서만 작동하니까 이게 필수 과정
    //  수동으로 class-validator 돌리기
    const errors = await validate(createBookDto);
    console.log('Book', errors);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // 서비스로 전달해서 DB에 저장
    return this.booksService.create(createBookDto);
  }


  @Get()
  findPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // 카테고리는 'title' 또는 'author'만 허용
    const validCategory = category === 'title' || category === 'author' ? category : undefined;
    const keywordValue = keyword?.trim() || undefined;

    return this.booksService.searchBooksPaginated(
      pageNum,
      limitNum,
      validCategory,
      keywordValue,
    );
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      // 업로드된 파일이 저장될 디렉토리 설정 (서버 내부 경로)
      destination: './uploads/books',

      // 저장될 파일명 설정: "image-1687256381234-123456789.jpg" 같은 형식
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname); // 원래 파일의 확장자 추출 (.jpg, .png 등)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // 최종 파일명 생성
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any) {
    console.log('body :: id ', body, id);
    // 기존 이미지 유지 or 새 이미지로 교체
    const imageUrl = file ? `/uploads/books/${file.filename}` : body.image;

    const fullBody = {
      ...body,
      stock: parseInt(body.stock as unknown as string, 10),
      image: imageUrl,
    };

    const updateBookDto = plainToInstance(UpdateBookDto, fullBody);
    const errors = await validate(updateBookDto);
    console.log('Book :: put ', errors);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
