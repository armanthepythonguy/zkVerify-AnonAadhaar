import type { NextApiRequest, NextApiResponse } from 'next';
import { CurveType, Library, ZkVerifyEvents, zkVerifySession } from 'zkverifyjs';

type responseData = {
    message: string;
    hash?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<responseData>) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { vkey, proof, publicSignals} = req.body;
    console.log(publicSignals)
    const session = await zkVerifySession.start().Testnet().withAccount(process.env.SEED_PHRASE);
    const {events, txResults} = await session.verify()
        .groth16(Library.snarkjs, CurveType.bn128).waitForPublishedAttestation()
        .execute({proofData: {
            vk: vkey,
            proof: proof,
            publicSignals: publicSignals
        }});

    events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
        console.log('Transaction included in block:', eventData);
        // Handle the event data as needed
        res.status(200).json({ message: 'Transaction included in block', hash: eventData.txHash });
    });

}