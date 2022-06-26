import * as chai from 'chai';
import { expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { artifacts, deployments, ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { FacetA, FacetB, IDiamondCut } from '../typechain'
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { FacetCutAction } from 'hardhat-deploy/dist/types';
import { ZERO_ADDRESS } from './utils';
chai.use(solidity);
chai.use(smock.matchers);

const sigsFromABI = (abi: any[]): string[] =>
  abi
    .filter(frag => frag.type === 'function')
    .map(frag => Interface.getSighash(FunctionFragment.from(frag)));

const FACETS = ['FacetA', 'FacetB'];
const MESSAGE = 'BOOM';

describe('FacetA', () => {
  let deployer: SignerWithAddress;
  let diamondAddr: string,
    facetA: FacetA,
    facetBFake: FakeContract<FacetB>;

  describe('without fixtures', async () => {
    beforeEach(async () => {
      [deployer] = await ethers.getSigners();

      // We're letting hardhat-deploy take care of deploying the diamond proxy as well
      // as the specified facets.
      const deploy = await deployments.diamond.deploy('OurDiamond', {
        from: deployer.address,
        owner: deployer.address,
        facets: FACETS
      });
      diamondAddr = deploy.address;

      // Although the Diamond proxy at the deployed address has registered both
      // facets, we really just want the FacetA functionality to be available from
      // our typescript object here - this is why `facetA` is typed `FacetA`, not
      // `OurDiamond`. Keep in mind that a diamond is really just a proxy with a bit
      // more routing abilities. So calling methods from any facet contract directly
      // on the diamond deployed address is the expected way of doing things.
      facetA = await ethers.getContractAt('FacetA', diamondAddr);
    });

    describe('foo/1', async () => {
      before(async () => {
        // Prepare a fake for our FacetB.
        facetBFake = await smock.fake('FacetB');
      });

      beforeEach(async () => {
        // Reset our fakes / mocks.
        facetBFake.bar.reset();

        // Grab our FacetB ABI.
        const facetBAbi = await artifacts.readArtifact('FacetB');
        // We will have our fake account for all the calls that can be made on FacetB. So
        // let's just take all the function selectors from the ABI.
        const facetBSels = sigsFromABI(facetBAbi.abi);
        // Now grab a handle to our DiamondCut implementation, sitting as a facet of our deployed diamond.
        const facetCut = await ethers.getContractAt('IDiamondCut', diamondAddr) as IDiamondCut;
        // We will now replace FacetB with our fake.
        // The operation consists of a single cut - replacing FacetB address with our fake's one.
        // Perform our facet replacement.
        // IMPORTANT: If you comment out this statement, you will see facets call each other properly.
        //            Do this if you want to see the expected "live" behaviour.
        await facetCut.diamondCut([{
          facetAddress: facetBFake.address,
          action: FacetCutAction.Replace,
          functionSelectors: facetBSels
        }], ZERO_ADDRESS, '0x')
        // At this point, our fake address should be seen by the diamond implementation as an implementer
        // of all of FacetB's function signatures.
      });

      // This is IMO the most important thing that Smock should improve on. Calling
      // facetA.foo() subsequently calls `FacetB.bar/0` and we should be able to verify
      // that.
      it('should call FacetB.bar/0 and FacetB.baz/1', async () => {
        // We mock `FacetB.bar/1` to return a determined value.
        facetBFake.bar.returns(MESSAGE);
        // We call FacetA.foo/3 - which in turns should call FacetB.bar/1.
        await facetA.foo('Hello, FacetB.bar/1!');
        // At this point, `facetBFake.bar` should be populated with one call.
        // However, the function call fails, and the EVM crashes with:
        // > Error: Transaction reverted: function returned an unexpected amount of data
        // It seems to me that the fake is being called, but doesn't know how to react,
        // almost as if we didn't give the `facetBFake.bar.returns(...)` instruction.
        expect(facetBFake.bar).to.have.been.calledOnceWith(MESSAGE);
      });

      // The next three tests should allow to query the storage. It is very common for
      // diamond-based architectures to store data at "storage slots". I think it would be
      // great if Smock could allow to check whether a variable was set at a given storage
      // slot.
      it('should set LibA.data().message to the given value');
    });
  });

  describe('using fixtures fixtures', async () => {
    // Pay attention here:
    const diamondFixture = deployments.createFixture(async (hre, ops) => {
      return await hre.deployments.diamond.deploy('OurDiamond', {
        from: deployer.address,
        owner: deployer.address,
        facets: FACETS
      });
    });

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      // Pay attention here:
      const deploy = await diamondFixture();
      diamondAddr = deploy.address;
      facetA = await ethers.getContractAt('FacetA', diamondAddr);
    });

    describe('foo/1', async () => {
      before(async () => {
        facetBFake = await smock.fake('FacetB');
      });

      beforeEach(async () => {
        facetBFake.bar.reset();

        const facetBAbi = await artifacts.readArtifact('FacetB');
        const facetBSels = sigsFromABI(facetBAbi.abi);
        const facetCut = await ethers.getContractAt('IDiamondCut', diamondAddr) as IDiamondCut;
        await facetCut.diamondCut([{
          facetAddress: facetBFake.address,
          action: FacetCutAction.Replace,
          functionSelectors: facetBSels
        }], ZERO_ADDRESS, '0x')
      });

      it('should call FacetB.bar/0 and FacetB.baz/1', async () => {
        facetBFake.bar.returns(MESSAGE);
        await facetA.foo('Hello, FacetB.bar/1!');
        expect(facetBFake.bar).to.have.been.calledOnceWith(MESSAGE);
      });
      it('should set LibA.data().message to the given value');
    });
  });
});
