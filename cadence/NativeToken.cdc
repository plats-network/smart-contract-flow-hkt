pub contract NativeToken {
    pub resource Vault {
        pub var balance: UFix64
        init(balance: UFix64) {
            self.balance = balance
        }
        pub fun withdraw(amount: UFix64): @Vault {
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }
        pub fun deposit(from: @Vault) {
            self.balance = self.balance + from.balance
            destroy from
        }
    }
    pub fun createVault(): @Vault {
        return <-create Vault(balance:100.0)
    }
    pub fun getValue(): UFix64 {
        return self.getValue();
    }
    init() {
        let vault <- self.createVault()
        self.account.save(<-vault, to: /storage/NativeToken)
    }
}