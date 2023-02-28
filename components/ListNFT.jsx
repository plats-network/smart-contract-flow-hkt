import { ContainerContext } from "context/ContextProvider";
import React, { useContext, useEffect } from "react";
import * as fcl from "@onflow/fcl";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");
const SIMPLE_SCRIPTS = `
      import CLH_NFT2 from 0x74f3fa5ca9768942;
      pub fun main(): [CLH_NFT2.SNFT]{
      let account:Address = 0x2295f2d4b6e99580;
      var total = CLH_NFT2.totalSupply;
      var index:UInt64 = 0;
      let collection = getAccount(account).getCapability(/public/CLH_NFT2CollectionPublic).borrow<&CLH_NFT2.Collection>() ?? panic("loi")
      var results:[CLH_NFT2.SNFT] = [];
      while index < total {
        let x = collection.borrowNFT(id: index);
        let item = CLH_NFT2.SNFT (name: x?.name,imageUrl: x?.imageUrl,price: x?.price,owner: x?.ofOwner)
        index = index + 1;
      results.append(item)
      }
      return results;
      }
`;
function ListNFT() {
  const { listNFT, setListNFT, currentUser } = useContext(ContainerContext);
  console.log("listNFT: ", listNFT);
  useEffect(() => {
    const handleGet = async () => {
      try {
        const respone = await fcl.query({
          cadence: SIMPLE_SCRIPTS,
        });
        setListNFT(respone);
      } catch (error) {}
    };
    handleGet();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-10">
      {listNFT?.map((item, index) => {
        return <NFT {...item} currentUser={currentUser} />;
      })}
    </div>
  );
}

export default ListNFT;

function NFT({ imageUrl, name, price, owner, currentUser }) {
  console.log("owner: ", owner);
  console.log("currrent: ", currentUser.addr);
  return (
    <div className="cursor-pointer hover:border-shadow-yellow p-2 rounded-xl border-[1px] border-yellow-200">
      <div className="">
        <img
          src={imageUrl}
          alt=""
          className="rounded-lg object-cover h-[250px]"
        />
      </div>
      <div className="flex flex-col items-center mt-2">
        <h3 className="font-medium text-md">{name}</h3>
        <div className="inline-block border-[1px] border-yellow-400 rounded-xl py-2 px-5 my-2 ">
          {price} ETH
        </div>
      </div>
      <div>
        <button
          className={`block w-full bg-yellow-400 text-white p-2 rounded-lg border-[1px] border-yellow-400 ${
            currentUser.addr == owner && "opacity-50"
          } `}
          disabled={currentUser.addr === owner}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
