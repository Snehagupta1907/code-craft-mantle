"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { COUNTER_ABI, COUNTER_CONTRACT_ADDRESS } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ConnectWallet";

export default function CounterApp() {
  const { address } = useAccount();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load Contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum && address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const counter = new ethers.Contract(
          COUNTER_CONTRACT_ADDRESS,
          COUNTER_ABI,
          signer
        );
        setContract(counter);
      }
    };
    init();
  }, [address]);

  // Fetch Count
  const fetchCount = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const value = await contract.getCount();
      setCount(Number(value.toString()));
    } catch (err) {
      console.error("Failed to fetch count:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCount();
  }, [contract]);

  // Increment
  const increment = async () => {
    if (!contract) return;
    try {
      const tx = await contract.increment();
      await tx.wait();
      fetchCount();
    } catch (err) {
      console.error("Increment failed:", err);
    }
  };

  // Reset
  const reset = async () => {
    if (!contract) return;
    try {
      const tx = await contract.reset();
      await tx.wait();
      fetchCount();
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">🔢 Counter DApp</h1>
      <div className="text-center">
        <ConnectButton />
      </div>

      {address && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <p className="text-2xl">
              Count:{" "}
              {loading ? (
                <span className="text-gray-500">Loading...</span>
              ) : (
                count
              )}
            </p>
            <div className="flex gap-4">
              <Button onClick={increment}>Increment</Button>
              <Button variant="destructive" onClick={reset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
