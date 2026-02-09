import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { extname } from "path";

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly s3Public: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "personal-os";
    const region = process.env.S3_REGION || "us-east-1";
    const credentials = {
      accessKeyId: process.env.S3_ACCESS_KEY || "",
      secretAccessKey: process.env.S3_SECRET_KEY || "",
    };

    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region,
      credentials,
      forcePathStyle: true,
    });

    // Separate client for presigned URLs using the browser-accessible endpoint
    this.s3Public = new S3Client({
      endpoint: process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT,
      region,
      credentials,
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.createBucketIfNotExists();
  }

  private async createBucketIfNotExists() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`);
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string; url: string }> {
    const ext = extname(file.originalname);
    const key = `${folder}/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = await this.getSignedUrl(key);
    return { key, url };
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Public, command, { expiresIn: 3600 });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  isS3Key(value: string): boolean {
    return !value.startsWith("http://") && !value.startsWith("https://");
  }

  async resolvePhotoUrl<T extends { photoUrl: string | null }>(
    entity: T,
  ): Promise<T> {
    if (entity.photoUrl && this.isS3Key(entity.photoUrl)) {
      return {
        ...entity,
        photoUrl: await this.getSignedUrl(entity.photoUrl),
      };
    }
    return entity;
  }

  async resolvePhotoUrls<T extends { photoUrl: string | null }>(
    entities: T[],
  ): Promise<T[]> {
    return Promise.all(entities.map((e) => this.resolvePhotoUrl(e)));
  }
}
