# RGT Bookstore API

NestJS 기반의 온라인 서점 API입니다. 책 등록, 조회, 수정, 삭제 및 검색 기능을 제공합니다.

> Tech Stack: NestJS, TypeORM, PostgreSQL, Docker

## 도커 컴포즈 실행
- PostgreSQL 데이터베이스와 NestJS 애플리케이션을 도커 컴포즈로 실행합니다.
- 실행시 localhost:3001에서 애플리케이션에 접근할 수 있습니다.
```bash
  docker-compose up --build 
```

## 시드추가

- 시드 데이터 사용법 (`docker exec -it nestjs-app npm run seed`)

```bash
  docker exec -it nestjs-app npm run seed
```
## 데이터 베이스 초기화

```
rm -rf postgres
```

## 책 등록 (Create)

- **URL**: `POST /books`
- **설명**: 책 정보를 생성하고 이미지 파일을 업로드합니다.
- **폼 필드**:
    - `title`: 책 제목 (string)
    - `author`: 저자 (string)
    - `description`: 설명 (string)
    - `stock`: 수량 (number)
    - `image`: 파일 업로드 (multipart/form-data)
- **예외 처리**:
    - 유효성 검사 실패 시 `400 Bad Request`

---

## 책 목록 조회 (Read - List)

- **URL**: `GET /books`
- **설명**: 페이지네이션 및 검색 조건을 통해 책 목록을 조회합니다.
- **쿼리 파라미터**:
    - `page`: 페이지 번호 (기본값: 1)
    - `limit`: 페이지당 항목 수 (기본값: 10)
    - `category`: 검색 대상 필드 (`title` | `author`)
    - `keyword`: 검색어

---

## 책 단일 조회 (Read - Detail)

- **URL**: `GET /books/:id`
- **설명**: 특정 책의 상세 정보를 조회합니다.
- **URL 파라미터**:
    - `id`: 책의 고유 ID

---

## 책 수정 (Update)

- **URL**: `PUT /books/:id`
- **설명**: 책 정보를 수정합니다. 이미지가 업로드되면 기존 이미지를 교체합니다.
- **폼 필드**:
    - `title`, `author`, `description`, `stock`, `image`
- **URL 파라미터**:
    - `id`: 수정할 책의 고유 ID
- **예외 처리**:
    - 유효성 검사 실패 시 `400 Bad Request`

---

## 책 삭제 (Delete)

- **URL**: `DELETE /books/:id`
- **설명**: 특정 책을 데이터베이스에서 삭제합니다.
- **URL 파라미터**:
    - `id`: 삭제할 책의 고유 ID
