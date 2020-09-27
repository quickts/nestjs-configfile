export interface ConfigOptions {
    config_root: string;
    parsers?: { [type: string]: (data: string) => any };
}

export interface OnConfigUpdate {
    onConfigUpdate(config: any, filepath: string): any;
}
