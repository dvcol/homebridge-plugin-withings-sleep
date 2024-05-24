import { ContentType } from './http.model.js';

import type { FastifyRequest } from 'fastify/types/request.js';

import type { RouteHandler } from 'fastify/types/route.js';

type Endpoint = {
  uri: string;
  log: string;
  state?: boolean;
  sensor?: 'switch' | 'occupancy';
};

export const endpoints: Endpoint[] = [
  {
    uri: '/withings/on',
    log: 'Failed to toggle on the sensor',
    state: true,
  },
  {
    uri: '/withings/off',
    log: 'Failed to toggle off the sensor',
    state: false,
  },
  {
    uri: '/withings/switch/on',
    log: 'Failed to toggle on the switch',
    sensor: 'switch',
    state: true,
  },
  {
    uri: '/withings/switch/off',
    log: 'Failed to toggle off the switch',
    sensor: 'switch',
    state: false,
  },
  {
    uri: '/withings/occupancy/on',
    log: 'Failed to toggle on the occupancy sensor',
    sensor: 'occupancy',
    state: true,
  },
  {
    uri: '/withings/occupancy/off',
    log: 'Failed to toggle off the occupancy sensor',
    sensor: 'occupancy',
    state: false,
  },
];

export const getResponseHandler: (params: {
  success: (request: FastifyRequest) => void | Promise<void>;
  error: (error: unknown) => void | Promise<void>;
}) => RouteHandler =
  ({ success, error }) =>
  async (request, reply) => {
    try {
      await success(request);
      reply.status(200).type(ContentType.ApplicationJson).send();
    } catch (err) {
      await error(err);
      reply
        .status(500)
        .type(ContentType.ApplicationJson)
        .send({ error: err instanceof Error ? err.message : err });
    }
  };
