import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { List } from "./list.entity";


@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })//空でもいい
  description?: string;

  @Column()
  position!: number;

  @Column({ default: false })
  completed: boolean = false;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column()
  listId!: number;

  @ManyToOne(() => List, (list) => list.cards, { onDelete: "CASCADE" })//リストを削除すると、関連するカードも削除される
  list?: List;
  //逆にカードは複数,リストは一つ

  @CreateDateColumn()
  readonly createdAt?: Date;//データが作成された時間,勝手に入るカラムでも編集したくないのでreadonly

  @UpdateDateColumn()
  readonly updatedAt?: Date;//更新された時のじかんをこれに入れてくれる。
  //いつ作成されたか、いつ更新されたかは実際にアプリケーション上で使わなくても大事。
}
