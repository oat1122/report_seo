import { PrismaAiOverviewRepository } from "./infrastructure/PrismaAiOverviewRepository";
import { LocalAiOverviewImageStorage } from "./infrastructure/LocalAiOverviewImageStorage";
import { listAiOverviewsUseCase } from "./application/use-cases/listAiOverviews";
import { createAiOverviewUseCase } from "./application/use-cases/createAiOverview";
import { updateAiOverviewUseCase } from "./application/use-cases/updateAiOverview";
import { deleteAiOverviewUseCase } from "./application/use-cases/deleteAiOverview";

const repo = new PrismaAiOverviewRepository();
const storage = new LocalAiOverviewImageStorage();

export const listAiOverviews = listAiOverviewsUseCase(repo);
export const createAiOverview = createAiOverviewUseCase(repo, storage);
export const updateAiOverview = updateAiOverviewUseCase(repo, storage);
export const deleteAiOverview = deleteAiOverviewUseCase(repo, storage);

export {
  aiOverviewCreateSchema,
  aiOverviewUpdateSchema,
  imagesToDeleteSchema,
  MAX_AI_OVERVIEW_IMAGES,
  type AiOverviewCreateInput,
  type AiOverviewUpdateInput,
} from "./schemas";
export type {
  SerializedAiOverview,
  SerializedAiOverviewImage,
} from "./domain/AiOverview";
