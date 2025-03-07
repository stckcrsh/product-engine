import axios from 'axios';

import { MBService } from './mb.service';

const REX_GO_URL = 'http://localhost:8070';

const DataEndpoint = [
  {
    dataRef: 'http://localhost:1202/data/udx_credit_bureau_hard_pull',
    dictionary: [],
    displayName: 'UDX CREDIT BUREAU HARD PULL',
    dynamic: false,
    restricted: false,
    selfRef: 'http://localhost:1202/dictionary/udx_credit_bureau_hard_pull',
    service: 'udx_credit_bureau_hard_pull',
  },
];

export class RexGoService {
  constructor(private mbService: MBService) {}

  async validatePolicy(policy: Record<string, any>): Promise<{result: Record<string, any>, errors?: any}> {
    try {
    const result = await axios.put(`${REX_GO_URL}/policy/validate`, policy);
    return {
      result: result.data,
    };
    } catch (e) {
      console.log('Error validating policy', e);

      return {
        result: null,
        errors: e.response.data,
      };
    }

  }

  async executePolicy(config: {
    policy: Record<string, any>;
    dataSources: Record<string, any>;
    executionRequest: Record<string, any>;
    pricingGrids: Record<string, any>;
    subPolicies: Record<string, any>;
  }): Promise<any> {
    // run the policy
    await this.setupDatasources(config.dataSources || {});

    const result = await axios.post(`${REX_GO_URL}/policy/execute`, {
      policy: config.policy,
      dataSources: config.dataSources || {},
      executionRequest: config.executionRequest || {},
      pricingGrids: config.pricingGrids || {},
      subPolicies: config.subPolicies || {},
    });

    const imposterResponse = await this.mbService.getImposter(1202);

    return {
      result: result.data,
      calls: imposterResponse.data.requests,
    };
  }

  async setupDatasources(datasources: Record<string, any>): Promise<void> {
    try {
      await this.mbService.deleteImposter(1202);
    } catch (e) {
      console.log('Imposter not found');
    }

    const predicates = Object.entries(datasources).map(([key, value]) => ({
      predicates: [
        {
          equals: {
            path: `/data/${key}`,
          },
        },
      ],
      responses: [
        {
          is: {
            body: JSON.stringify(value),
          },
        },
      ],
    }));

    // setup the datasources
    await this.mbService.createImposter({
      port: 1202,
      protocol: 'http',
      recordRequests: true,
      stubs: [
        {
          predicates: [
            {
              equals: {
                path: '/data',
              },
            },
          ],
          responses: [
            {
              is: {
                body: JSON.stringify(DataEndpoint),
              },
            },
          ],
        },
        ...predicates,
      ],
    });
  }
}
