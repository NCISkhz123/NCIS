export const ALL_MODULE_KEYS = ["CSSD", "LAUNDRY", "AMBULANCE"] as const;

export type ModuleKey = (typeof ALL_MODULE_KEYS)[number];
