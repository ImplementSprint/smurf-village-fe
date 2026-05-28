export declare class StatutoryRateDto {
    type: 'percentage' | 'fixed_amount';
    value: number;
}
export declare class SetStatutoryDeductionsDto {
    sss?: StatutoryRateDto;
    philhealth?: StatutoryRateDto;
    pagibig?: StatutoryRateDto;
    notes?: string;
}
