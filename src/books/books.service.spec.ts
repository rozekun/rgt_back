import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BooksService } from './books.service'
import { ILike } from 'typeorm'
import { Book } from './entities/book.entity'

// 테스트에 사용할 가짜 책 데이터
const mockBooks = [
  {
    id: 1,
    title: '노아의 개발일기',
    description: '테스트용 책입니다.',
    image: '/uploads/books/mock.jpg',
    author: '노아',
    stock: 5,
    createdAt: new Date(),
  },
  {
    id: 2,
    title: 'NestJS 마스터',
    description: '실전 NestJS 가이드',
    image: '/uploads/books/nest.jpg',
    author: '홍길동',
    stock: 3,
    createdAt: new Date(),
  },
]

describe('BooksService', () => {
  let service: BooksService

  // TypeORM Repository를 대신할 mock 객체
  const mockRepo = {
    findAndCount: jest.fn(),   // 페이징 & 조건 검색
    save: jest.fn(),           // 데이터 저장 (POST)
    update: jest.fn(),         // 데이터 수정 (PUT)
    findOneBy: jest.fn(),      // 수정 후 조회용
  }

  beforeEach(async () => {
    // Nest 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepo,
        },
      ],
    }).compile()

    service = module.get<BooksService>(BooksService)
  })

  it('should be defined', () => {
    // 서비스가 잘 생성되었는지 기본 확인
    expect(service).toBeDefined()
  })

  it('searchBooksPaginated - 저자 검색 시 where 조건이 정확히 전달되는지 확인한다', async () => {
    // 목 데이터를 기반으로 '홍길동' 저자만 필터링
    const filteredBooks = mockBooks.filter(book => book.author.includes('홍길동'))

    // 리포지토리의 findAndCount가 이 값을 반환하도록 설정
    const spy = jest.spyOn(mockRepo, 'findAndCount')
    spy.mockResolvedValueOnce([filteredBooks, filteredBooks.length])

    // 서비스 메서드 호출
    await service.searchBooksPaginated(1, 10, 'author', '홍길동')

    // 리포지토리가 ILike 조건으로 호출되었는지 확인
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        author: ILike('%홍길동%'),
      },
      skip: 0,
      take: 10,
      order: { createdAt: 'DESC' },
    }))
  })

  it('searchBooksPaginated - 제목 검색 시 where 조건이 정확히 전달되는지 확인한다', async () => {
    // '노아'가 포함된 제목을 가진 책만 필터링
    const filteredBooks = mockBooks.filter(book => book.title.includes('노아'))

    const spy = jest.spyOn(mockRepo, 'findAndCount')
    spy.mockResolvedValueOnce([filteredBooks, filteredBooks.length])

    await service.searchBooksPaginated(1, 10, 'title', '노아')

    // 리포지토리가 ILike 조건으로 호출되었는지 확인
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        title: ILike('%노아%'),
      },
      skip: 0,
      take: 10,
      order: { createdAt: 'DESC' },
    }))
  })

  it('create - 책을 생성하고 반환해야 한다', async () => {
    const createDto = {
      title: '새 책',
      description: '설명',
      author: '노아',
      stock: 5,
      image: '/uploads/books/abc.jpg',
    }

    // save가 성공적으로 책을 저장했다고 가정
    mockRepo.save.mockResolvedValue({ id: 1, ...createDto })

    // 서비스의 create 메서드 호출
    const result = await service.create(createDto)

    // Repository의 save가 올바르게 호출되었는지 확인
    expect(mockRepo.save).toHaveBeenCalledWith(createDto)

    // 반환값에 ID가 포함되고 제목이 일치하는지 확인
    expect(result).toHaveProperty('id')
    expect(result.title).toBe('새 책')
  })

  it('update - 책 정보를 수정하고 최종 값을 반환해야 한다', async () => {
    const updateDto = {
      title: '수정된 책',
      stock: 10,
      description: '업데이트 설명',
      image: '/uploads/books/updated.jpg',
      author: '노아',
    }

    // update는 반환값이 없으므로 그냥 undefined로 처리
    mockRepo.update.mockResolvedValue(undefined)

    // findOneBy는 업데이트된 책을 다시 조회해주는 역할
    mockRepo.findOneBy.mockResolvedValue({ id: 1, ...updateDto })

    const result = await service.update(1, updateDto)

    // update가 올바른 파라미터로 호출되었는지 확인
    expect(mockRepo.update).toHaveBeenCalledWith(1, updateDto)

    // 반환된 책의 제목이 기대값인지 확인
    expect(result).not.toBeNull()
    expect((result as Book).title).toBe('수정된 책')
  })

})