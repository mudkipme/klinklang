/* eslint-disable no-extend-native */

export default function patchBigInt (): void {
  // @ts-expect-error
  BigInt.prototype.toJSON = function () {
    return this.toString()
  }
}
