import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigFileModule } from "../src";
import { resolve } from "path";
@Module({
    imports: [
        ConfigFileModule.forRoot({
            config_root: resolve(__dirname, "..", "config"),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
