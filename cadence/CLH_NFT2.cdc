import NonFungibleToken from 0x74f3fa5ca9768942;

pub contract CLH_NFT2: NonFungibleToken {

    pub var totalSupply: UInt64
    pub var sellNFTs: @{UInt64: NonFungibleToken.NFT};
    pub var listSellNfts: @[NonFungibleToken.NFT];
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub struct SNFT {
    pub var name:String;
    pub var imageUrl:String;
    pub var price: UInt64;
    pub var owner: Address;
    pub var isSell: Bool;
    init(name:String?, imageUrl:String?,price:UInt64?, owner:Address?) {
      self.name = name!;
      self.imageUrl = imageUrl!;
      self.owner = owner!;
      self.price = price!;
      self.isSell = false;
    }
  }
    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64 ;
        pub var imageUrl: String;
        pub var name: String;
        pub(set) var price: UInt64;
        pub(set) var ofOwner: Address?;
        pub(set) var isSell: Bool;


        init(_ imageUrl: String,_ name: String,_ price: UInt64,_ ofOwner: Address) {
            self.id = CLH_NFT2.totalSupply
            CLH_NFT2.totalSupply = CLH_NFT2.totalSupply + 1
            self.imageUrl = imageUrl;
            self.name = name;
            self.price = price;
            self.ofOwner = ofOwner;
            self.isSell = false;
        }
    }

    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("This NFT does not exist")
            log(self.owner?.address)
        
            emit Withdraw(id: token.id, from: self.owner?.address)

            return <- token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @CLH_NFT2.NFT

            emit Deposit(id: token.id, to: self.owner?.address)

            self.ownedNFTs[token.id] <-! token
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT? {
            let x = &self.ownedNFTs[id] as &NonFungibleToken.NFT?;
            return x;
        }
            pub fun sellNFT(id:UInt64){
            pre {
                self.ownedNFTs[id] != nil: "NFT does not exist in the collection!"
            } 
            let x <-! self.ownedNFTs.remove(key: id)
            CLH_NFT2.sellNFTs[id] <-! x;
        }
        pub fun buyNFT(nft: @NonFungibleToken.NFT) {
            self.ownedNFTs[nft.uuid] <-! nft;
        }
        init() {
            self.ownedNFTs <- {}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    pub fun mintNFT(imageUrl: String, name: String, price: UInt64, owner: Address): @NFT {
        return <- create NFT(imageUrl,name, price, owner)
    }

    pub fun borrowSellNFT(id: UInt64): &NonFungibleToken.NFT? {
        pre {
            CLH_NFT2.sellNFTs[id] != nil: "This tokenId does not exsit in dictionary";
        }
        let x = &CLH_NFT2.sellNFTs[id] as &NonFungibleToken.NFT?
        return x;
    }

    init() {
        self.totalSupply = 0
        self.sellNFTs <- {}
        self.listSellNfts <- [];
    }
}
 