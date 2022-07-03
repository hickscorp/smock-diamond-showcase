import * as chai from 'chai';
import { expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { artifacts, deployments, ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { FacetA, FacetB } from '../typechain'
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { FacetCutAction } from 'hardhat-deploy/dist/types';
chai.use(solidity);
chai.use(smock.matchers);

const sigsFromABI = (abi: any[]): string[] =>
  abi
    .filter(frag => frag.type === 'function')
    .map(frag => Interface.getSighash(FunctionFragment.from(frag)));

const MESSAGE = 'Message!';
const MOCKED_MESSAGE = 'Mocked message!'

describe('FacetA', () => {
  let deployer: SignerWithAddress,
    facetBSels: string[];
  let diamondAddr: string,
    facetA: FacetA,
    fakeFacetB: FakeContract<FacetB>;

  before(async () => {
    [deployer] = await ethers.getSigners();
    // We will have our fake account for all the calls that can be made on FacetB. So
    // let's just take all the function selectors from the ABI.
    facetBSels = sigsFromABI((await artifacts.readArtifact('FacetB')).abi);
    // Prepare a fake for our FacetB.
    fakeFacetB = await smock.fake('FacetB');
  });

  beforeEach(async () => {
    // Reset our fakes / mocks, stub what needs to be stubbed.
    fakeFacetB.foo.reset();
    fakeFacetB.foo.returns(MOCKED_MESSAGE);
  });

  const deployDiamond = async () => {
    // We're letting hardhat-deploy take care of deploying the diamond proxy as well
    // as the specified facets.
    const deploy = await deployments.diamond.deploy('OurDiamond', {
      from: deployer.address,
      owner: deployer.address,
      facets: ['FacetA', 'FacetB']
    });
    diamondAddr = deploy.address;
    facetA = await ethers.getContractAt('FacetA', diamondAddr);
  };

  const useFacetBFake = async () => {
    const diamond = await ethers.getContract('OurDiamond');
    await diamond.diamondCut([{
      facetAddress: fakeFacetB.address,
      action: FacetCutAction.Replace,
      functionSelectors: facetBSels
    }], ethers.constants.AddressZero, '0x')
  };

  const addTests = () => {
    describe('read/0', async () => {
      it('should delegate to FacetB.foo', async () => {
        await facetA.read(MESSAGE);
        expect(fakeFacetB.foo).to.have.been
          .calledWith(MESSAGE)
          .delegatedFrom(diamondAddr);
      });

      it('should return what FacetB returns', async () => {
        const result = await facetA.read(MESSAGE);
        expect(result).to.eq(MOCKED_MESSAGE);
      });
    });

    describe('write/1', async () => {
      it('should delegate to FacetB.bar', async () => {
        await facetA.write(MESSAGE);
        expect(fakeFacetB.bar).to.have.been
          .calledWith(MESSAGE)
          .delegatedFrom(diamondAddr);
      });
    });
  };

  describe('foo/1', async () => {
    beforeEach(async () => {
      // Deploys diamond, replaces FacetB by fake.
      await deployDiamond();
      await useFacetBFake();
    });
    addTests();
  });

  describe('foo/1 using fixtures', async () => {
    let deployDiamondFixture: () => Promise<any>;
    before(async () => {
      // Deploys diamond using hardhat-deploy fixture, uses FacetB fake.
      deployDiamondFixture = await deployments.createFixture(
        async (hre, /*opts*/) => deployDiamond()
      );
    });

    beforeEach(async () => {
      await deployDiamondFixture();
      await useFacetBFake();
    });
    addTests();
  });
});
