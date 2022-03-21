import {chainName} from '$lib/config';

export function wait<T>(numSeconds: number, v: T): Promise<T> {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), numSeconds * 1000);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(e: any): string {
  const errorMessage =
    e.data?.message || (e.data?.data ? JSON.stringify(e.data?.data) : e.message ? e.message : JSON.stringify(e)); //(e.toString ? e.toString() : ;
  if (errorMessage.indexOf(' could not be found') !== -1) {
    return `${chainName}'s node out of sync: "block ${errorMessage}"`;
  } else if (errorMessage.indexOf('No state available for block ') !== -1) {
    return `${chainName}'s node out of sync: "${errorMessage}"`;
  }
  return errorMessage;
}
