import Joi from "joi";

export class CreateShortUrlDto {
  url: string;
}

export const createShortUrlDtoValidation = Joi.object<CreateShortUrlDto>({
  url: Joi.string().uri().required(),
});
