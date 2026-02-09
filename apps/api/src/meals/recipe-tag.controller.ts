import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import { RecipeTagService } from "./recipe-tag.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("meals/tags")
@UseGuards(JwtAuthGuard)
export class RecipeTagController {
  constructor(private readonly tagService: RecipeTagService) {}

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Post()
  create(@Body() input: { name: string }) {
    return this.tagService.upsert(input.name);
  }
}
