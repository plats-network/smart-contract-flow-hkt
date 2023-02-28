import React, { createContext, useContext, useEffect, useState } from "react";

export const ContainerContext = createContext();
function ContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState("");
  const [isTransaction, setIsTransaction] = useState("");
  const [listNFT, setListNFT] = useState([]);
  return (
    <ContainerContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isTransaction,
        setIsTransaction,
        listNFT,
        setListNFT,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
}

export default ContextProvider;
