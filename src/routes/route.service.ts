import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as Services from '@services';
import * as Utils from '@utils';
import { RouteTemplate } from './route.interface';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: Services.PrismaService) {}

  create(data: RouteTemplate) {
    const { name, steps, userId, isPublic = false } = data;
    const convertedSteps = Utils.convertRawToRouteContent(steps);
    return this.prisma.routeTemplate.create({
      data: {
        name,
        rawContent: steps as unknown as Prisma.InputJsonValue,
        content: convertedSteps as unknown as Prisma.InputJsonValue,
        userId,
        isPublic,
      },
    });
  }

  findAllPublic() {
    return this.prisma.routeTemplate.findMany({
      where: { isPublic: true },
    });
  }

  findUserTemplates(userId: string) {
    return this.prisma.routeTemplate.findMany({
      where: { userId },
    });
  }

  findOne(id: string) {
    return this.prisma.routeTemplate.findUnique({ where: { id } });
  }

  delete(id: string) {
    return this.prisma.routeTemplate.delete({ where: { id } });
  }
}
