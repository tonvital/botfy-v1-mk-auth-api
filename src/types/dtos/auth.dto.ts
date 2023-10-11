import { object, string, number, date, InferType } from 'yup'

/**
 * Generate Access Token DTO
 */
export const GenerateAccessTokenDTOSchema = object({
  username: string().required(),
  password: string().required()
})

export type GenerateAccessTokenDTO = InferType<
  typeof GenerateAccessTokenDTOSchema
>

/**
 * Refresh Access Token DTO
 */
export const RefreshAccessTokenDTOSchema = object({
  username: string().required(),
  password: string().required(),
  refreshToken: string().required()
})

export type RefreshAccessTokenDTO = InferType<
  typeof RefreshAccessTokenDTOSchema
>
