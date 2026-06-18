import { IsOptional, IsPhoneNumber, isPhoneNumber, IsString } from "class-validator";

export class UpdateProfileDto {

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    timezone?: string;
}