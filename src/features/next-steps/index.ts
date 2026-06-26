import { PrismaNextStepRepository } from './infrastructure/PrismaNextStepRepository'
import { LocalNextStepImageStorage } from './infrastructure/LocalNextStepImageStorage'
import { listNextStepsUseCase } from './application/use-cases/listNextSteps'
import { addNextStepUseCase } from './application/use-cases/addNextStep'
import { updateNextStepUseCase } from './application/use-cases/updateNextStep'
import { deleteNextStepUseCase } from './application/use-cases/deleteNextStep'

const repo = new PrismaNextStepRepository()
const storage = new LocalNextStepImageStorage()

export const listNextSteps = listNextStepsUseCase(repo)
export const addNextStep = addNextStepUseCase(repo, storage)
export const updateNextStep = updateNextStepUseCase(repo, storage)
export const deleteNextStep = deleteNextStepUseCase(repo, storage)

export {
  nextStepSchema,
  normalizeDescription,
  imagesToDeleteSchema,
  MAX_NEXT_STEP_IMAGES,
  type NextStepInput,
} from './schemas'
export type { NextStep, NextStepImage, NextStepPriority } from './domain/NextStep'
