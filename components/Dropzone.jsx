// import { MarketContext } from "@/context/MarketProvider";
import { create } from "ipfs-http-client";
import Image from "next/image";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaPercent } from "react-icons/fa";
import * as fcl from "@onflow/fcl";
import types from "@onflow/types";
import images from "../public/img";
import { ContainerContext } from "context/ContextProvider";
import ListNFT from "./ListNFT";
const IMAGE_MAX_SIZE = 5000000;

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");
const SIMPLE_TRANSACTION = `\
import CLH_NFT2 from 0x74f3fa5ca9768942;
transaction(name: String,image: String, price: UInt64){ // truyen tham so o day
  prepare(acct: AuthAccount) {
    if acct.borrow<&CLH_NFT2.Collection>(from: /storage/CLH_NFT2Collection) == nil {
      acct.save(<-CLH_NFT2.createEmptyCollection(), to: /storage/CLH_NFT2Collection);
      acct.link<&CLH_NFT2.Collection>(/public/CLH_NFT2CollectionPublic, target: /storage/CLH_NFT2Collection);
    }
    let collection = acct.borrow<&CLH_NFT2.Collection>(from: /storage/CLH_NFT2Collection)!
    collection.deposit(token: <- CLH_NFT2.mintNFT(imageUrl: image, name: name, price: price, owner: acct.address))
  }
  execute {
  log("success")
  }
}
  `;

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

function DropZone() {
  const { currentUser, isTransaction, setIsTransaction, setListNFT, listNFT } =
    useContext(ContainerContext);
  const [isImage, setIsImage] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState();
  const [urlImage, setUrlImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const SUBDOMAIN = "https://chinh-nft-marketplace.infura-ipfs.io";
  const PROJECT_ID = "2LHcjIvWTrFNii6Wyzlezt6U6ov";
  const API_KEY_ID = "8a01c5ea50c6e287e2acb90c1e42fa64";
  const auth = `Basic ${Buffer.from(`${PROJECT_ID}:${API_KEY_ID}`).toString(
    "base64"
  )}`;
  const client = create({
    host: "infura-ipfs.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });
  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        console.log("uploading to ipfs...");
        const added = await client.add({ content: file });
        const url = `${SUBDOMAIN}/ipfs/${added.path}`;
        console.log("URL: ", url);
        return url;
      } catch (error) {
        console.log(error);
      }
    }
  };
  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);
    setUrlImage(url);
    setIsImage(true);
  }, []);
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: IMAGE_MAX_SIZE,
  });

  const handleCreate = async (name, price, urlImage) => {
    const transactionId = await fcl.mutate({
      cadence: SIMPLE_TRANSACTION,
      args: (arg, t) => [
        arg(name, t.String),
        arg(urlImage, t.String),
        arg(price, t.UInt64),
      ],
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
  const handleGet = async () => {
    try {
      const respone = await fcl.query({
        cadence: SIMPLE_SCRIPTS,
      });
      setListNFT(respone);
    } catch (error) {}
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div
        className="border-dashed border-2 border-yellow-400 rounded-xl p-4 cursor-pointer flex flex-col items-center"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <p>JPG, PNG, WEBM, MAX 100MB</p>
        <Image
          src={images.upload}
          alt="upload"
          className="bg-gray-400 rounded-3xl"
          width={120}
          height={120}
        />
        <p>Drag & drop file here</p>
        <p>or Browser media on your device</p>
      </div>
      {isImage && (
        <div className="border-dashed border-2 border-yellow-400 p-4 mt-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
            {/* left */}
            <div className="border-[1px] rounded-xl p-2 border-yellow-300 mx-auto md:mx-0">
              <img
                src={urlImage}
                alt="image"
                className="w-[150px] h-[150px] rounded-xl object-cover"
              />
            </div>
            {/* right */}
            <div className="flex-1 px-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <div className="break-all">
                  <span className=""> NFT Name:</span>{" "}
                  {name && (
                    <span className="ml-1  font-bold capitalize">{name}</span>
                  )}{" "}
                </div>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="">
                  <div className="break-all">
                    <span className="font-bold"> Description:</span>{" "}
                    {description && (
                      <span className="ml-1 text-[14px]">{description}</span>
                    )}{" "}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="">
                  <div className="break-all">
                    <span className="font-bold"> Price:</span>{" "}
                    {description && (
                      <span className="ml-1 text-[14px]">{price}</span>
                    )}{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="">
        <div className="mt-4">
          <label className="text-lg font-bold ml-3 text-yellow-400" htmlFor="">
            Item Name
          </label>
          <div className="mt-1 p-2 px-3 border-[1px] border-yellow-400 rounded-xl">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Women"
              type="text"
              className="placeholder:text-[13px] text-[13px] w-full bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col mt-2">
          <label className="text-lg font-bold ml-3 text-yellow-400" htmlFor="">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-[1px] rounded-xl mt-2 border-yellow-400 p-2 px-3 placeholder:text-[13px] text-[13px] outline-none bg-transparent"
            placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus labore tempora voluptatum laborum"
            name="description"
            id=""
            cols="20"
            rows="6"
          ></textarea>
        </div>

        <div className="mt-4">
          <InputItem
            value={price}
            onChange={(data) => setPrice(data)}
            heading="price"
            icon={<FaPercent />}
            placeholder="0.01 ETH"
          />
        </div>
        <div className="flex gap-4 mt-8 ">
          <button
            onClick={() => handleCreate(name, price, urlImage)}
            className={`capitalize flex items-center justify-center flex-1 bg-yellow-400 font-medium rounded-full py-2 px-4 hover:opacity-80 active:opacity-30 text-white ${
              isCreate && "opacity-50"
            }`}
            disabled={isLoading}
          >
            <p>Upload</p>
            {isCreate && (
              <Image
                src={images.loadingIcon}
                alt="loading"
                width={36}
                height={36}
                className="rounded-full ml-4"
              />
            )}
          </button>
        </div>
        <div className="flex gap-4 mt-8 ">
          <button
            onClick={() => handleGet()}
            className={`capitalize flex items-center justify-center flex-1 bg-yellow-400 font-medium rounded-full py-2 px-4 hover:opacity-80 active:opacity-30 text-white ${
              isCreate && "opacity-50"
            }`}
            disabled={isCreate}
          >
            <p>Get</p>
            {isCreate && (
              <Image
                src={images.loadingIcon}
                alt="loading"
                width={36}
                height={36}
                className="rounded-full ml-4"
              />
            )}
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[#00000066] flex items-center justify-center">
          <Image src={images.loading} alt="loading" />
        </div>
      )}
    </div>
  );
}

export function InputItem({ heading, icon, placeholder, value, onChange }) {
  return (
    <div className="">
      <h2 className="font-bold ml-3 capitalize mb-1">{heading}</h2>
      <div className="flex items-center border-[1px] border-yellow-400 rounded-xl overflow-hidden">
        <div className="bg-yellow-400 p-3 px-3 mr-3 text-white">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="number"
          placeholder={placeholder}
          className="flex-1 pr-1 placeholder:text-[14px] text-[14px] bg-transparent"
        />
      </div>
    </div>
  );
}

export default DropZone;
