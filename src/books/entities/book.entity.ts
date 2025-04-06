import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  author: string;

  //수량
  @Column()
  stock: number;

  //업로드 날짜
  @CreateDateColumn()
  createdAt: Date;
}
