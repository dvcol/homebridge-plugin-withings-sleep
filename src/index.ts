import Fastify from 'fastify';

import { AccessoryName, PluginName } from './homebridge.model.js';

import { endpoints, getResponseHandler } from './http.utils.js';

import type { AccessoryConfig, AccessoryPlugin, API, CharacteristicValue, HAP, Logging, Service } from 'homebridge';

/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export default (api: API) => {
  hap = api.hap;
  api.registerAccessory(AccessoryName, WithingSleepSwitch);
};

class WithingSleepSwitch implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly hosts: string[];
  private switchOn = false;
  private occupancyDetected = false;

  private readonly switchService: Service;
  private readonly occupancyService: Service;
  private readonly informationService: Service;

  initSwitchService() {
    const service = new hap.Service.Switch(`${this.name} Switch`);
    service
      .getCharacteristic(hap.Characteristic.On)
      .onGet(async () => {
        return this.switchOn;
      })
      .onSet((value: CharacteristicValue) => {
        this.switchOn = value as boolean;
        this.log.info(`Switch state was set to: ${this.switchOn}`);
      });

    this.log.info('Switch service initializing!');
    return service;
  }

  initOccupancyService() {
    const service = new hap.Service.OccupancySensor(`${this.name} Occupancy Sensor`);
    service
      .getCharacteristic(hap.Characteristic.OccupancyDetected)
      .onGet(() => {
        return this.occupancyDetected;
      })
      .onSet((value: CharacteristicValue) => {
        this.occupancyDetected = value as boolean;
        this.log.info(`Occupancy sensor state was set to: ${this.occupancyDetected}`);
      });
    return service;
  }

  initInformationService() {
    const service = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(hap.Characteristic.Model, 'Custom Model');

    this.log.info('Information service initializing!');
    return service;
  }

  toggle(state = true, sensor?: 'switch' | 'occupancy') {
    if (!sensor || sensor === 'switch') this.switchService.setCharacteristic(hap.Characteristic.On, state);
    if (!sensor || sensor === 'occupancy') this.occupancyService.setCharacteristic(hap.Characteristic.OccupancyDetected, state);
  }

  async startServer({ port = 3000 }: { port?: number }) {
    const app = Fastify({
      logger: true,
    });

    endpoints.forEach(({ uri, log, sensor, state }) => {
      app.get(
        uri,
        getResponseHandler({
          success: ({ ip, hostname }) => {
            if (this.hosts.length && !this.hosts.some(host => ip === host || hostname === host)) {
              throw new Error(`Host '${ip}' is not allowed`);
            }
            this.log.info(`Toggling ${sensor ?? 'sensor'} to ${state}`, { ip, hostname });
            this.toggle(state, sensor);
          },
          error: error => {
            this.log.error(log, error);
          },
        }),
      );
    });

    this.log.info('Starting the server...');

    try {
      await app.listen({ port });
      this.log.info(`Server listening on port '${port}'`);
    } catch (err) {
      const errorString = err instanceof Error ? err.message : err?.toString() ?? 'Unkown error';
      this.log.error(errorString);
      process.exit(1);
    }
  }

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;

    if (config.hosts?.length) {
      this.hosts = config.hosts;
      this.log.info('Configuring allowed hosts:', this.hosts);
    } else {
      this.hosts = [];
      this.log.warn('No hosts list provided, this might be unsafe');
    }

    this.switchService = this.initSwitchService();
    this.occupancyService = this.initOccupancyService();
    this.informationService = this.initInformationService();

    this.startServer({ port: Number(config.port) });
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log(PluginName);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService, this.occupancyService];
  }
}
