import {
  AnonAadhaarProof,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { useEffect, useState } from "react";
import { CurveType, Library, zkVerifySession } from "zkverifyjs";
import key from "./vkey.json";

type HomeProps = {
  setUseTestAadhaar: (state: boolean) => void;
  useTestAadhaar: boolean;
};

export default function Home({ setUseTestAadhaar, useTestAadhaar }: HomeProps) {
  // Use the Country Identity hook to get the status of the user.
  const[tx, setTx] = useState<string>("");
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  // async function verifyProof(){
  //   verifyAnonProof()
  //   const {events, txResults} = await session.verify().groth16(Library.snarkjs, CurveType.bn128)
  //     .execute({proofData:{vk: key, proof: latestProof?.proof.groth16Proof, publicSignals: [latestProof?.proof.pubkeyHash, latestProof?.proof.nullifier, latestProof?.proof.timestamp, latestProof?.proof.ageAbove18, latestProof?.proof.gender, latestProof?.proof.pincode, latestProof?.proof.state, latestProof?.proof.nullifierSeed, latestProof?.proof.signalHash]}})


  // }

  async function verifyProof(){
    const response = await fetch('/api/verify', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body:JSON.stringify({vkey: key, proof: latestProof?.proof.groth16Proof, publicSignals: [latestProof?.proof.pubkeyHash, latestProof?.proof.nullifier, latestProof?.proof.timestamp, latestProof?.proof.ageAbove18, latestProof?.proof.gender, latestProof?.proof.pincode, latestProof?.proof.state, latestProof?.proof.nullifierSeed, latestProof?.proof.signalHash]})});
    const data = await response.json();
    setTx(`https://zkverify-testnet.subscan.io/extrinsic/${data.hash}`);
  }

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log(anonAadhaar.status);
    }
  }, [anonAadhaar]);

  const switchAadhaar = () => {
    setUseTestAadhaar(!useTestAadhaar);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <main className="flex flex-col items-center gap-8 bg-white rounded-2xl max-w-screen-sm mx-auto h-[24rem] md:h-[20rem] p-8">
        <h1 className="font-bold text-2xl">Welcome to Anon Aadhaar Example</h1>
        <p>Prove your Identity anonymously using your Aadhaar card.</p>

        {/* Import the Connect Button component */}
        <LogInWithAnonAadhaar nullifierSeed={1234} />

        {useTestAadhaar ? (
          <p>
            You&apos;re using the <strong> test </strong> Aadhaar mode
          </p>
        ) : (
          <p>
            You&apos;re using the <strong> real </strong> Aadhaar mode
          </p>
        )}
        <button
          onClick={switchAadhaar}
          type="button"
          className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Switch for {useTestAadhaar ? "real" : "test"}
        </button>
      </main>
      <div className="flex flex-col items-center gap-4 rounded-2xl max-w-screen-sm mx-auto p-8">
        {/* Render the proof if generated and valid */}
        {anonAadhaar.status === "logged-in" && (
          <>
            <p>✅ Proof is valid</p>
            <p>Got your Aadhaar Identity Proof</p>
            <>Welcome anon!</>
            {latestProof && (
              <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
            )}
            <button onClick={verifyProof} className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"            >
              Verify Proof
            </button>
            {tx!="" && (<h2><a href={tx}>Click here to check your transaction</a></h2>)}
            
          </>
        )}
      </div>
    </div>
  );
}
