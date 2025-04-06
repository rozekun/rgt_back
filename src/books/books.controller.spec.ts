import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    findOne: jest.fn().mockResolvedValue({
      id: 1,
      title: '테스트 책',
      author: '노아',
      description: '설명',
      image: '/uploads/test.jpg',
      stock: 3,
      createdAt: new Date(),
    }),
    searchBooksPaginated: jest.fn().mockResolvedValue({
      total: 1,
      page: 1,
      totalPages: 1,
      books: [{
        id: 1,
        title: '노아의 일기',
        description: '검색 테스트 책',
        author: '노아',
        stock: 2,
        image: '/uploads/test.jpg',
        createdAt: new Date(),
      }],
    }),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('컨트롤러가 정상적으로 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  it('GET /books/:id - findOne이 올바르게 호출되어야 한다', async () => {
    // 컨트롤러가 문자열 '1'을 숫자 1로 변환해서 서비스로 전달
    const result = await controller.findOne('1');

    // 서비스가 정확한 인자(1)로 호출되었는지 확인
    expect(service.findOne).toHaveBeenCalledWith(1);

    // 결과에 title 프로퍼티가 있는지 확인
    expect(result).toHaveProperty('title', '테스트 책');
  });

  it('GET /books - searchBooksPaginated가 올바른 인자로 호출되어야 한다', async () => {
    // 쿼리 파라미터 값
    const page = '1';
    const limit = '10';
    const category = 'title';
    const keyword = '노아';

    // 컨트롤러 실행
    const result = await controller.findPaginated(page, limit, category, keyword);

    // 서비스가 숫자 변환된 파라미터로 호출되었는지 확인
    expect(service.searchBooksPaginated).toHaveBeenCalledWith(
      1,
      10,
      'title',
      '노아',
    );

    // 반환값 검증
    expect(result.books[0].title).toContain('노아');
  });

  describe('POST /books - create', () => {
    it('파일과 바디를 받아 책을 생성 요청해야 한다', async () => {
      const mockFile = { filename: 'upload.jpg' } as Express.Multer.File;
      const body = {
        title: '새 책',
        description: '설명',
        author: '저자',
        stock: 3,
      };

      // 기대되는 DTO
      const expectedDto = {
        ...body,
        image: `/uploads/books/${mockFile.filename}`,
      };

      // create 호출 시 해당 값이 반환되도록 설정
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(expectedDto as any);

      // 컨트롤러 메서드 호출
      const result = await controller.create(mockFile, body);

      // 서비스 호출 검증
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining(expectedDto));
      // 결과 일치 여부 확인
      expect(result).toEqual(expectedDto);
    });
  });

  describe('PUT /books/:id - update', () => {
    it('새 이미지 파일이 있을 경우 해당 경로로 업데이트해야 한다', async () => {
      const mockFile = { filename: 'new.jpg' } as Express.Multer.File;
      const body = {
        title: '수정 책',
        description: '설명',
        author: '저자',
        stock: '5', // 실제 요청에서는 문자열로 들어옴
        image: '/uploads/old.jpg',
      };

      // 기대 결과
      const expected = {
        ...body,
        stock: 5, // 숫자로 변환
        image: '/uploads/books/new.jpg',
      };

      // update 호출 시 해당 값을 리턴하도록 설정
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(expected as any);

      // 컨트롤러 메서드 호출
      const result = await controller.update('1', mockFile, body);

      // 서비스 호출 여부 확인
      expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining(expected));
      // 결과 값이 예상과 동일한지 확인
      expect(result).toEqual(expected);
    });
  });

});