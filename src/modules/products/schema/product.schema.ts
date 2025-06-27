import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

export interface ProductAttributes {
  id: number;
  name: string;
  price: number;
  productToken: string;
  stock: number;
}

export type ProductCreationAttributes = Omit<ProductAttributes, 'id'>;

@Table({ tableName: 'Product' })
export class Products extends Model<
  ProductAttributes,
  ProductCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, unique: true })
  productToken: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.INTEGER })
  stock: number;
}
