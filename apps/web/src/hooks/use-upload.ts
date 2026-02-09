import { useMutation } from "@tanstack/react-query";
import { apiUploadFile } from "../lib/api-client";
import type { UploadResult } from "@personal-os/domain";

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) =>
      apiUploadFile<UploadResult>("uploads", file, { folder }),
  });
}
