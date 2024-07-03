/* eslint-disable no-extend-native */

export default function patchBigInt (): void {
  // @ts-expect-error Patch BigInt to support JSON.stringify
  BigInt.prototype.toJSON = function() {
    return this.toString()
  }
}
