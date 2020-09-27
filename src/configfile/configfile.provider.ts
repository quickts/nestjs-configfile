import { Provider } from "@nestjs/common";
import { ConfigOptions } from "./configfile.interface";
import { CONFIGFILE_OPTION } from "./configfile.constants";

export function createProvider(configfileConfigOptions: ConfigOptions): Provider<ConfigOptions> {
    return {
        provide: CONFIGFILE_OPTION,
        useValue: configfileConfigOptions,
    };
}
