import { IS_DEV_MODE } from "./env"


export function getLoggerConfig() {
    if(IS_DEV_MODE) {
        return {
            transport: {
                target: 'pino-pretty',
                options: {
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              },
        }
    }

    return true;
}