import { BigNumber, ethers } from 'ethers';

const ZERO_ADDRESS = ethers.constants.AddressZero;
const ZERO_ACCOUNT_MOCK = { getAddress: () => ZERO_ADDRESS };

function toHexString(amount: BigNumber) {
  return amount.toHexString().replace(/0x0+/, '0x');
}

export { ZERO_ADDRESS, ZERO_ACCOUNT_MOCK, toHexString }
