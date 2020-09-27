import { Injectable } from "@nestjs/common";
import { Config } from "../src";
@Injectable()
export class AppService {
    @Config("test.yml")
    testConfig: any;

    constructor() {}
    onConfigUpdate(config, path) {
        console.log("配置更新啦", path);
    }
    async getHello() {
        return {
            hello: "Hello World!",
            testConfig: this.testConfig,
        };
    }
    //
}
