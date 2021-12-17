// Get The AlgoSigner package from the Browser Window
const { AlgoSigner } = window;
let signedTxs;

// declare variables
const connectBtn = document.querySelector(".connect");
const submitBtn = document.querySelector(".submitBtn");
const amount = document.querySelector(".amount");
const yes = document.querySelector(".yes");
const no = document.querySelector(".no");
let userChoice = null;

// Define Addresses
const zero_Address =
  "A2BN4EQHE7OGBNQITOMHVCO4PC36XXJXMCIIVS3YJFYTXJNAX2ZP3ML7QQ";
const one_Address =
  "K6WPIOES2UGY5ZYRC3ZDATRTCUHXE2A54QQ72R3HIW7BT2G44VDCRPWDVQ";
let mainAddress = "";

//  Helper Functions
const setAddress = (add) => {
  mainAddress = add;
};
const setUserChoice = (choice) => {
  userChoice = choice;
};

//Main Functions
const connectWalletToAlgoSigner = async () => {
  if (!AlgoSigner) {
    return alert("Please install AlgoSigner Browser Extension");
  }
  await AlgoSigner.connect().then((d) => {
    console.log(`connected ${d}`);
    connectBtn.textContent = "Connected";
  });
};

const submitTxn = async (value) => {
  try {
    const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
    const indexerServer = "https://testnet-algorand.api.purestake.io/idx2";
    const token = { "X-API-Key": "FmjLsTUUlC1rp69DbyzGp8r74DPCCNR98cspJDq3" };
    const port = "";

    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    const indexerClient = new algosdk.Indexer(token, indexerServer, port);

    const health = await algodClient.healthCheck().do();
    console.log(health);

    let suggestedParams = await algodClient.getTransactionParams().do();

    // Use the JS SDK to build a Transaction
    let sdkTx = new algosdk.Transaction({
      to: mainAddress,
      from: value,
      amount: +(amount.value * 100000),
      ...suggestedParams,
    });
    let binaryTx = sdkTx.toByte();
    let base64Tx = AlgoSigner.encoding.msgpackToBase64(binaryTx);

    let signedTxs = await AlgoSigner.signTxn([
      {
        txn: base64Tx,
      },
    ]);

    await AlgoSigner.send({
      ledger: "TestNet",
      tx: signedTxs[0].blob,
    });
    console.log(signedTxs);

    // await algodClient.sendRawTransaction(signedTxn).do();
     await algodClient
      .pendingTransactionInformation(tx.txId)
      .do()
      .then((d) => {
        console.log(d);
      })
      .catch((e) => {
        console.error(e);
      });
  } catch (e) {
    console.log(e);
  }
};


[yes, no].forEach((e) => {
  e.addEventListener("click", (e) => {
    setUserChoice(e.target.textContent);
if(userChoice =="YES"){
  yes.classList.add(".green")
  no.classList.remove("red")
}
else{
    yes.classList.remove(".green");
    no.classList.add("red");
}  });
});
connectBtn.addEventListener("click", async () => {
  await connectWalletToAlgoSigner();
});
submitBtn.addEventListener("click", async () => {
  try {
    if (!userChoice) {
      return alert("Please Select Either Yes Or  No");
    }
    if (userChoice == "YES") {
      setAddress(one_Address);
    } else if (userChoice == "NO") {
      setAddress(zero_Address);
    }
    const addr = await AlgoSigner.accounts({ ledger: "TestNet" });
    const val = addr[0];
    const { address } = val;
    await submitTxn(address);
  } catch (e) {
    console.log(e);
  }
});
