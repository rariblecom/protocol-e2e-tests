import {EthAssetType, RaribleV2Order} from "@rarible/ethereum-api-client"
import {Erc20AssetType} from "@rarible/ethereum-api-client/build/models"
import {RaribleSdk} from "@rarible/protocol-ethereum-sdk"
import {toAddress} from "@rarible/types"
import {retry} from "../common/retry"
import {expectLength} from "../common/expect-equal"
import {printLog, RETRY_ATTEMPTS, runLogging} from "./util"
import {
	ASSET_TYPE_CRYPTO_PUNK,
	ORDER_TYPE_RARIBLE_V2,
} from "./crypto-punks"
import {checkApiNoRaribleBids, checkBidFields, getBidsForPunkByType} from "./common-bid"

/**
 * Creates RaribleV2 punk bid.
 */
export async function createRaribleBidOrder(
	maker: string,
	makeAssetType: EthAssetType | Erc20AssetType,
	price: number,
	sdk: RaribleSdk
): Promise<RaribleV2Order> {
	let isErc20 = "contract" in makeAssetType
	let bidOrder = await runLogging(
		`create ${isErc20 ? "ERC20" : "ETH"} bid order with price ${price}`,
		sdk.order.bid({
			makeAssetType: makeAssetType,
			amount: 1,
			maker: toAddress(maker),
			originFees: [],
			payouts: [],
			price: 10,
			takeAssetType: ASSET_TYPE_CRYPTO_PUNK,
		}).then((order) => order as RaribleV2Order)
	)
	printLog(`Created RaribleV2 bid order: ${JSON.stringify(bidOrder)}`)
	await checkApiRaribleBidExists(maker)
	checkBidFields(bidOrder, maker, makeAssetType, price)
	return bidOrder
}

/**
 * Cancels Rarible punk bids via API.
 */
export async function cancelRaribleBids(
	sdk: RaribleSdk,
	maker: string
) {
	const bids = await getRariblePunkBids(maker)
	if (bids.length === 0) {
		printLog(`No Rarible bids to cancel from ${maker}`)
		return
	}
	printLog(`Bids to cancel with maker = ${maker}: ${bids.length}: ${JSON.stringify(bids)}`)

	for (const bid of bids) {
		await runLogging(
			`cancel bid ${JSON.stringify(bid)}`,
			sdk.order.cancel(bid)
		)
	}
	await checkApiNoRaribleBids()
}

export async function checkApiRaribleBidExists(maker: string) {
	await retry(RETRY_ATTEMPTS, async () => {
		const bids = await getRariblePunkBids(maker)
		expectLength(bids, 1, `bid from ${maker}`)
	})
}

/**
 * Request RaribleV2 bids from API.
 */
export async function getRariblePunkBids(maker: string | undefined): Promise<RaribleV2Order[]> {
	return await runLogging(
		`request RaribleV2 punk bids from API from ${maker}`,
		getBidsForPunkByType<RaribleV2Order>(maker, ORDER_TYPE_RARIBLE_V2)
	)
}