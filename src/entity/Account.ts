import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, IsUUID, PrimaryKey, BeforeUpdate, BeforeCreate } from "sequelize-typescript";
import bcrypt from 'bcrypt';
import { uuid } from "uuidv4";
import { Op } from "sequelize";

@Table
export class Account extends Model {
    @PrimaryKey
    @Column
    id: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    username: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    firstName: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    lastName: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.ENUM('super-administrator', 'administrator', 'pracownik', 'menadżer', 'administrator-wspólnoty'),
        allowNull: false,
        defaultValue: 'pracownik',
    })
    role: 'super-administrator' | 'administrator' | 'pracownik' | 'menadżer' | 'administrator-wspólnoty';

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    emailVerified: boolean;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BeforeCreate
    static async setPassword(instance: Account) {
        if (instance.changed('password')) {
            instance.password = await bcrypt.hash(instance.password, 12);
        }
    }

    @BeforeCreate
    static async setId(instance: Account) {
        instance.id = uuid()
    }

    static async verifyPassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    static async findByUsername(username: string) {
        return await Account.findOne({ where: { username } });
    }

    static async findById(id: string) {
        return await Account.findOne({ where: { id } });
    }

    static async findByEmail(email: string) {
        return await Account.findOne({ where: { email } });
    }

    static async findByLogin(login: string) {
        return await Account.findOne({
            where: {
                [Op.or]: [
                    { username: login },
                    { email: login },
                ],
            },
        });
    }

    static async findAccount(ctx: any, id: any, token: any) { // eslint-disable-line no-unused-vars
        console.log('findAccount', id, token);
        // token is a reference to the token used for which a given account is being loaded,
        //   it is undefined in scenarios where account claims are returned from authorization endpoint
        // ctx is the koa request context
        return await Account.findById(id);
    }
}