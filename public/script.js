// Get The AlgoSigner package from the Browser Window
/*
When the AlgoSigner broweser extensio is downloaded,
the AlgoSigner library is injected into the browser window

The Code Below just Helps us get the object that interacts with that library
It is what helps us to interact with the Algorand BlockChain
*/
const { AlgoSigner } = window;


// declare variables
let signedTxs; //This Variable is to be used to store the Signed transaction

//What document.querySelector does here is help us pick the element with the specific class of ".connect"
//NOTE: The period(".") at the beginning of the connect just tells javascript to target a class

//The connectBtn is the button that we use to connect to the algorand network
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


//! HELPER FUNCTIONS

//This sets the address the algo is going to be sent to.
//THe fucntion will be called when the user either clicks on yes or no
const setAddress = (add) => {
  mainAddress = add;
};

//This function will set the variable userChoice to either yes or no when it is clicked
// The yes or no variable will be used to determin the addrress the algo will be sent to
const setUserChoice = (choice) => {
  userChoice = choice;
};

//*MAIN FUNCTIONS */


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
    const val = amount.value * 1000000
    let sdkTx = new algosdk.Transaction({
      to: mainAddress,
      from: value,
      amount: +val,
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
    setUserChoice(e.target.innerHTML);
if(userChoice =="YES"){
  yes.classList.add("bg-blue-500", "text-white");
  no.classList.remove("bg-red-500")
  no.classList.add("text-gray-900");

  yes.classList.remove("text-gray-900")
}
else{
  no.classList.add("bg-red-500", "text-white");
  yes.classList.remove("bg-blue-500");
  yes.classList.add("text-gray-900")
  no.classList.remove("text-gray-900");
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
