import type { ValidationError } from "../common/index.ts";
import { UPLOAD_MAX_FILE_SIZE, UPLOAD_ALLOWED_MIME_TYPES } from "./constants.ts";

export function validateUpload(file: {
  size: number;
  mimetype: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (file.size > UPLOAD_MAX_FILE_SIZE) {
    errors.push({
      field: "file",
      message: `File size must not exceed ${UPLOAD_MAX_FILE_SIZE / (1024 * 1024)} MB`,
    });
  }

  if (
    !UPLOAD_ALLOWED_MIME_TYPES.includes(
      file.mimetype as (typeof UPLOAD_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    errors.push({
      field: "file",
      message: `File type must be one of: ${UPLOAD_ALLOWED_MIME_TYPES.join(", ")}`,
    });
  }

  return errors;
}
