export declare enum DeductionType {
    PERCENTAGE = "percentage",
    FIXED_AMOUNT = "fixed_amount"
}
export declare class ConfigureStatutoryDeductionDto {
    type: DeductionType;
    value: number;
}
export declare class ConfigureBenefitDefaultsDto {
    sss?: ConfigureStatutoryDeductionDto;
    philhealth?: ConfigureStatutoryDeductionDto;
    pagibig?: ConfigureStatutoryDeductionDto;
    notes?: string;
}
