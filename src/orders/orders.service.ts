import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { PrismaClient } from '../../generated/prisma'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { OrderPaginationDto } from './dto/order-pagination.dto'
import { ChangeOrderStatusDto } from './dto'
import { PRODUCT_SERVICE } from 'src/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService')

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super()
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected')
  }

  async create(createOrderDto: CreateOrderDto) {
    const ids = [5, 600]

    const products = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, ids),
    )
    return products

    // return {
    //   service: 'Orders MicroService',
    //   createOrderDto: createOrderDto,
    // }
    // return this.order.create({
    //   data: createOrderDto,
    // })
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page = 1, limit = 10 } = orderPaginationDto

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    })

    const lastPage = Math.ceil(totalPages / limit)

    // const currentPage = orderPaginationDto.page
    // const perPage = orderPaginationDto.limit

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    }
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    })

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      })
    }
    return order
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto

    const order = await this.findOne(id)

    if (order.status === status) return order

    return this.order.update({
      where: { id },
      data: { status: status },
    })
  }
}
