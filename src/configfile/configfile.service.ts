import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ScannerService } from "@quickts/nestjs-scanner";
import { watch, FSWatcher } from "chokidar";
import { readFileSync } from "fs";
import { join } from "path";
import { safeLoad } from "js-yaml";
import { CONFIGFILE_OPTION, CONFIGFILE_METADATA } from "./configfile.constants";
import { ConfigOptions } from "./configfile.interface";

@Injectable()
export class ConfigFileService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ConfigFileService.name);
    private readonly listeners = new Map<string, Function[]>();
    private watcher: FSWatcher = null;
    constructor(
        private readonly scannerService: ScannerService, //
        @Inject(CONFIGFILE_OPTION) private readonly options: ConfigOptions
    ) { }

    async onModuleInit() {
        this.logger.log(`Watch Config Root: ${this.options.config_root}`);
        await this.scannerService.scanProviderPropertyMetadates(CONFIGFILE_METADATA, async (instance, propertyKey, metadata) => {
            const fun = async (config: any) => {
                try {
                    instance[propertyKey] = config;
                    if (instance["onConfigUpdate"]) {
                        await instance["onConfigUpdate"](config, metadata.filepath);
                    }
                } catch (err) {
                    this.logger.error(err);
                }
            };
            const key = metadata.filepath.replace("\\", "/");
            if (this.listeners.has(key)) {
                const listeners = this.listeners.get(key);
                listeners.push(fun);
            } else {
                this.listeners.set(key, [fun]);
            }
        });

        this.watcher = watch(".", { cwd: this.options.config_root });
        this.watcher.on("add", this.onFileChange.bind(this));
        this.watcher.on("change", this.onFileChange.bind(this));
        await new Promise((resolve) => {
            this.watcher.on("ready", resolve);
        })
    }

    onFileChange(path: string) {
        this.logger.log(`Config ${path} update!`);
        const result = /\.([^\.]+)$/.exec(path);
        if (!result) {
            this.logger.warn(`No extension of ${path}`);
            return;
        }
        const key = path.replace("\\", "/");
        const listeners = this.listeners.get(key);
        if (!listeners) {
            this.logger.warn(`No listener of ${path}`);
            return;
        }

        try {
            const file_data = readFileSync(join(this.options.config_root, path), "utf-8");
            const config = Object.freeze(this.parseFileData(file_data, result[1]));
            for (const listener of listeners) {
                listener(config);
            }
        } catch (err) {
            this.logger.error("Parser config error!");
            this.logger.error(err);
        }
    }

    parseFileData(file_data: string, file_type: string) {
        if (this.options.parsers && this.options.parsers[file_type]) {
            return this.options.parsers[file_type](file_data);
        }
        if (file_type == "json") {
            return JSON.parse(file_data);
        } else if (file_type == "yaml" || file_type == "yml") {
            return safeLoad(file_data);
        } else {
            throw new Error("Unknown file type!");
        }
    }

    async onModuleDestroy() {
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }
        this.listeners.clear();
    }
}
