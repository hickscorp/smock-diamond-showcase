import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-diamond-abi';
import 'solidity-coverage';
import 'hardhat-gas-reporter';


const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.4',
    settings: {
      outputSelection: {
        '*': {
          '*': ['storageLayout']
        }
      }
    }
  },
  networks: {
    hardhat: { saveDeployments: false }
  },
  diamondAbi: [{
    name: 'OurDiamond',
    include: [
      'IERC173',
      'IERC165',
      'IDiamondCut',
      'IDiamondLoupe',
      'FacetA',
      'FacetB'
    ]
  }],
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined
  }
};
export default config;
