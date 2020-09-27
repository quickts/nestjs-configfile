import { Module, DynamicModule, Global } from "@nestjs/common";
import { ScannerModule } from "@quickts/nestjs-scanner";
import { ConfigOptions } from "./configfile.interface";
import { createProvider } from "./configfile.provider";
import { ConfigFileService } from "./configfile.service";

@Module({})
export class ConfigFileModule {
    static forRoot(options: ConfigOptions): DynamicModule {
        const provider = createProvider(options);
        return {
            module: ConfigFileModule,
            imports: [ScannerModule.forRoot(false)],
            providers: [provider, ConfigFileService],
            exports: [ConfigFileService],
        };
    }
}

@Global()
@Module({})
export class ConfigFileGlobalModule {
    static forRoot(options: ConfigOptions): DynamicModule {
        const provider = createProvider(options);
        return {
            module: ConfigFileGlobalModule,
            imports: [ScannerModule.forRoot(true)],
            providers: [provider, ConfigFileService],
            exports: [ConfigFileService],
        };
    }
}
