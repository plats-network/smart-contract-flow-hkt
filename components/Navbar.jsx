import Head from "next/head";
import { Button } from "components";
import * as fcl from "@onflow/fcl";
import types from "@onflow/types";
import Link from "next/link";
import { GrClose } from "react-icons/gr";
import images from "../public/img";
import Image from "next/image";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import ContextProvider, { ContainerContext } from "context/ContextProvider";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

const SIMPLE_TRANSACTION = `\
  import NativeToken from 0x74f3fa5ca9768942;
  transaction {
  prepare(acct: AuthAccount) {
    if acct.borrow<&NativeToken.Vault>(from: /storage/NativeToken) == nil{
      acct.save(<- NativeToken.createVault(), to: /storage/NativeToken)
      acct.link<&NativeToken.Vault>(/public/NativeTokenPublic, target: /storage/NativeToken)
    }
    let vaultRef = acct.borrow<&NativeToken.Vault>(from: /storage/NativeToken)
        ?? panic("Could not borrow a reference to the owner's vault")
  log(vaultRef.balance);
    let temporaryVault <- vaultRef.withdraw(amount: 10.0)
    //vaultRef.deposit(from: <-temporaryVault)
    //log("Withdraw/Deposit succeeded!")
    log(vaultRef.balance)
    destroy temporaryVault;
  }
  execute {
  }
}
`;

export default function Navbar() {
  const { currentUser, setCurrentUser, isTransaction, setIsTransaction } =
    useContext(ContainerContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = () => {
    fcl.authenticate();
  };
  useEffect(() => {
    fcl.currentUser.subscribe(setCurrentUser);
  }, []);
  const handleDeposit = async () => {
    const transactionId = await fcl.mutate({
      cadence: SIMPLE_TRANSACTION,
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      limit: 5000,
    });
    setIsLoading(true);
    const transaction = await fcl.tx(transactionId).onceSealed();
    if (transactionId) {
      setIsTransaction(transactionId);
    }
    setIsLoading(false);
  };
  const handleClose = () => {
    setIsTransaction("");
  };
  return (
    <div>
      <nav className="flex items-center justify-between px-20 h-[70px] bg-gray-800">
        <Link href="/">
          <i className="text-[36px] font-bold cursor-pointer">FLOW NFT</i>
        </Link>
        <div className="flex gap-6">
          <Button handleClick={handleDeposit} btnName="Deposit" />
          <Button
            handleClick={() => router.push("/createNft")}
            btnName="Create NFT"
          />
          <Button
            btnName={currentUser.addr ? currentUser.addr : "Login"}
            handleClick={handleLogin}
          />
        </div>
      </nav>
      {isTransaction && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#05050a99]">
          <div className="w-[300px] absolute top-[70px] z-[100] left-[50%] -translate-x-[50%] rounded-xl text-center p-4 bg-gray-600">
            <h3 className="text-lg font-medium">Create NFT</h3>
            <i>(Your transaction successfully)</i>
            <Link
              target="_blank"
              href={`https://testnet.flowscan.org/transaction/${isTransaction}`}
              className="p-1 px-4 border-blue-600 border-2 rounded-md bg-blue-800 text-white mt-3 block hover:opacity-60"
            >
              <p>
                {isTransaction.slice(0, 10)}.....
                {isTransaction.slice(-10)}
              </p>
            </Link>
            <div
              onClick={handleClose}
              className="absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer hover:opacity-40 "
            >
              <GrClose />
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#00000066] flex items-center justify-center">
          <Image src={images.loading} alt="loading" />
        </div>
      )}
    </div>
  );
}
