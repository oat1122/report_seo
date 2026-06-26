import { PrismaNextStepRepository } from './infrastructure/PrismaNextStepRepository'
import { listNextStepsUseCase } from './application/use-cases/listNextSteps'
import { addNextStepUseCase } from './application/use-cases/addNextStep'
import { updateNextStepUseCase } from './application/use-cases/updateNextStep'
import { deleteNextStepUseCase } from './application/use-cases/deleteNextStep'

const repo = new PrismaNextStepRepository()

export const listNextSteps = listNextStepsUseCase(repo)
export const addNextStep = addNextStepUseCase(repo)
export const updateNextStep = updateNextStepUseCase(repo)
export const deleteNextStep = deleteNextStepUseCase(repo)

export { nextStepSchema, normalizeDescription, type NextStepInput } from './schemas'
export type { NextStep, NextStepPriority } from './domain/NextStep'
