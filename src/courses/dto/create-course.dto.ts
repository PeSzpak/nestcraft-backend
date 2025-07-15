import { IsString, Max} from "class-validator"

export class CreateCourseDTO {
    @IsString()
    readonly name: string

    @IsString()
    @Max(60) 
    readonly description: string

    @IsString({each: true})
    readonly tags: string[]
}