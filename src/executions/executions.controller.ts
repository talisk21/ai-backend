import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ExecutionsService } from "./executions.service";

@Controller("executions")
export class ExecutionsController {
  constructor(private readonly service: ExecutionsService) {
  }

  @Post()
  create() {
    return this.service.createExecution();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.getExecution(id);
  }

  @Post(":id/steps")
  addStep(
    @Param("id") executionId: string,
    @Body() body: { type: string; input: any }
  ) {
    return this.service.addStep(executionId, body.type, body.input);
  }

  @Get() // ← новый метод
  findAll() {
    return this.service.findAll();
  }
}