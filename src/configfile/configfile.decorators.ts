import { CONFIGFILE_METADATA } from "./configfile.constants";

export function Config(filepath: string) {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.set(target, propertyKey, null);
        Reflect.defineMetadata(CONFIGFILE_METADATA, { filepath }, target, propertyKey);
    };
}
