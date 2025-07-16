import { IsString, Max, MaxLength} from "class-validator"

export class CreateCourseDTO {
    @IsString()
    readonly name: string

    @IsString()
    @MaxLength(300) 
    readonly description: string

    @IsString({each: true})
    readonly tags: string[]
}