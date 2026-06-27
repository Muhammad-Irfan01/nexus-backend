import { IsDate, IsDateString, IsOptional } from "class-validator";


export class DateRangeDto {
    @IsOptional()
    @IsDateString()
    startDate?: Date;


    @IsOptional()
    @IsDateString()
    endDate?: Date;
} 