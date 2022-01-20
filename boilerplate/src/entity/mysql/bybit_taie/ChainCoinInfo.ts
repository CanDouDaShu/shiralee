import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { EntityModel } from '@midwayjs/orm';

@EntityModel({
  database: 'bybit_taie',
  name: 'chain_coin_info',
})
@Unique('IDX_Chain_Coin', ['chain', 'coin'])
export class ChainCoinInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'coin',
    comment: 'coin',
  })
  coin: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'coin_name',
    comment: 'coin_name',
  })
  coinName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'display_name',
    comment: 'display_name',
  })
  displayName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'contract_address',
    comment: 'contract_address',
  })
  contractAddress: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'chain',
    comment: 'chain',
  })
  chain: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    name: 'state',
    comment: 'state',
  })
  state: number;

  @Column({
    type: 'tinyint',
    nullable: false,
    name: 'withdraw_state',
    comment: 'withdraw_state',
  })
  withdrawState: number;

  @Column({
    type: 'tinyint',
    nullable: false,
    name: 'deposit_state',
    comment: 'deposit_state',
  })
  depositState: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'decimals',
    comment: 'decimals',
  })
  decimals: number;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'label',
    comment: 'label',
  })
  label: string;

  @Column({
    type: 'decimal',
    precision: 58,
    scale: 18,
    default: 0,
    nullable: false,
    name: 'min_amount',
    comment: 'min_amount',
  })
  minAmount: number;

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: false,
    name: 'visit_chain_limit',
    comment: 'visit_chain_limit',
  })
  visitChainLimit: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
    comment: '创建时间',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
    comment: '更新时间',
  })
  updateAt: Date;
}
