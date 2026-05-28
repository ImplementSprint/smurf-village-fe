type EnvValue = string | undefined;
type EnvMap = Record<string, EnvValue>;
export declare function validateEnv(input: EnvMap): EnvMap;
export {};
