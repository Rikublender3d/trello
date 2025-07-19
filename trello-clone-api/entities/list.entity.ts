import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Card } from "./card.entity";
@Entity()
export class List {

  @PrimaryGeneratedColumn()//値が自動的に生成
  id!: number;

  @Column()
  title!: string;

  @Column()
  position!: number;

  @OneToMany(() => Card, (card) => card.list, { cascade: true })//カードとリストの関係性
  //リストは複数のカードを持っている
  //リストを削除すると、関連するカードも削除される
//デコレーターがついたものはカラムには作成されないが、tsでそのままアクセスして使える。list.cardsとかで。逆にcard.listも。


  cards?: Card[];

  @CreateDateColumn()
  readonly createdAt?: Date;

  @UpdateDateColumn()
  readonly updatedAt?: Date;

}