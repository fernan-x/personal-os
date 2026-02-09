import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UploadService } from "./upload.service";
import { validateUpload, UPLOAD_MAX_FILE_SIZE } from "@personal-os/domain";

@Controller("uploads")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folder: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const errors = validateUpload({
      size: file.size,
      mimetype: file.mimetype,
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.uploadService.upload(file, folder || "uploads");
  }
}
