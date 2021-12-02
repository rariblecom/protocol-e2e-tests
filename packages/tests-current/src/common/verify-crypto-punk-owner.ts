import { Contract } from "web3-eth-contract"
import {RETRY_ATTEMPTS} from "../cryptoPunks/util"
import { retry } from "./retry"
import { expectEqual } from "./expect-equal"

export async function verifyCryptoPunkOwner(c: Contract, punkIndex: number, owner: string) {
	await retry(RETRY_ATTEMPTS, async () => {
		const actualOwner = await c.methods.punkIndexToAddress(punkIndex).call()
		expectEqual(actualOwner.toLowerCase(), owner, `owner of punk ${punkIndex}`)
	})
}
