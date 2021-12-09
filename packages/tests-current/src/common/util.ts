import {createRaribleSdk} from "@rarible/protocol-ethereum-sdk"
import {EthAssetType} from "@rarible/ethereum-api-client"

export const RETRY_ATTEMPTS = 8
export const TEST_TIMEOUT = 120000

function getMessage(message: any): string {
	let testName = expect.getState().currentTestName
	return `--- ${testName} ---\n${message}`
}

export function printLog(message: any, ...optionalParams: any[]) {
	let fullMessage = getMessage(message)
	console.log(fullMessage, optionalParams)
}

export function printError(message: any, ...optionalParams: any[]) {
	let fullMessage = getMessage(message)
	console.error(fullMessage, optionalParams)
}

export async function runLogging<T extends any>(
	computationName: string,
	computation: Promise<T>
): Promise<T> {
	try {
		printLog(`started '${computationName}'`)
		let result = await computation
		printLog(`finished '${computationName}'`)
		return result
	} catch (e) {
		printError(`failed '${computationName}'`, e)
		throw e
	}
}

export const ASSET_TYPE_ETH: EthAssetType = {
	"assetClass": "ETH",
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const apiSdk = createRaribleSdk(undefined, "e2e")