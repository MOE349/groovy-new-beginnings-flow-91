/**
 * useFileData Hook
 * Custom hook for fetching and managing file data
 */

import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/api/fileService";
import type { FileItem } from "../types";

export const useFileData = (linkToModel: string, linkToId: string) => {
  return useQuery({
    queryKey: ["files", linkToModel, linkToId],
    queryFn: () => fileService.getFiles(linkToModel, linkToId),
    enabled: !!(linkToModel && linkToId),
  });
};
