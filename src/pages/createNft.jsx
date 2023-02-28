import { DropZone } from "components";
import React, { useContext, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { ContainerContext } from "context/ContextProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import { GrClose } from "react-icons/gr";
fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

function CreateNftPage() {
  const { setCurrentUser, isTransaction, setIsTransaction } =
    useContext(ContainerContext);
  const router = useRouter();
  useEffect(() => {
    fcl.authenticate();
    fcl.currentUser.subscribe(setCurrentUser);
  }, []);
  const handleClose = () => {
    setIsTransaction("");
    router.push("/");
  };
  const handleLink = () => {
    setIsTransaction("");
    router.push("/");
  };
  return (
    <div className="px-5 md:px-10 lg:px-20 pt-10">
      <div>
        <div className="max-w-[500px]">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-center md:text-left">
              Create NFT
            </h1>
            <p className="mt-2 text-center md:text-left">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Quibusdam sed numquam officiis minima quae{" "}
            </p>
          </div>
        </div>
        <hr className="my-8" />
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-center md:text-left">
            Image, Video Audio, or 3D Model
          </h1>
          <p className="mt-2 text-center md:text-left">
            File types supported: JPG, PNG, GIF, SVG, MP4, MP3, OGG, GLB. Max
            size: 100MB
          </p>
        </div>

        <hr className="my-8" />
      </div>
      <DropZone />

      {/* alert transaction */}
      {isTransaction && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#05050a99]">
          <div className="w-[300px] absolute top-[70px] z-[100] left-[50%] -translate-x-[50%] rounded-xl text-center p-4 bg-gray-600">
            <h3 className="text-lg font-medium">Create NFT</h3>
            <i>(Your transaction successfully)</i>
            <Link
              onClick={handleLink}
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
    </div>
  );
}

export default CreateNftPage;
