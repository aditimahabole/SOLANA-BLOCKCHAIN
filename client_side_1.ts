// ----------------------------------
import * as Web3 from "@solana/web3.js";
import * as fs from "fs";
import dotenv from "dotenv";
import "colors";
// ----------------------------------
const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa");
// the address of the ping program itself.
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod");
//  address of an account that stores the data for the program
// ----------------------------------

dotenv.config();
// ----initialize key pair ----------
async function initialize_key_pair(
  connection: Web3.Connection
): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log("PVT key does not exist so creating for you buddy....".red);
    const signer = Web3.Keypair.generate();
    console.log("Creating .env file".green);
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
    await air_drop_sol_if_needed(signer, connection);
    return signer;
  }
  // if it exists then
  console.log("PRIVATE KEY EXISTS ALREADY!".cyan);
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "");
  const secret_key = Uint8Array.from(secret);
  const key_from_secret = Web3.Keypair.fromSecretKey(secret_key);
  await air_drop_sol_if_needed(key_from_secret, connection);
  return key_from_secret;
}
// ----air drop sol if needed-----
async function air_drop_sol_if_needed(
  signer: Web3.Keypair,
  connection: Web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log(
    "Current balance is : \n".yellow,
    balance / Web3.LAMPORTS_PER_SOL,
    "SOL"
  );
  var current_balance = balance / Web3.LAMPORTS_PER_SOL;
  if (current_balance < 1) {
    console.log("Air Dropping 1 Sol".green);
    const airdrop_signature = await connection.requestAirdrop(
      signer.publicKey,
      Web3.LAMPORTS_PER_SOL
    );
    const latest_block_hash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latest_block_hash.blockhash,
      lastValidBlockHeight: latest_block_hash.lastValidBlockHeight,
      signature: airdrop_signature,
    });
    const new_balance = await connection.getBalance(signer.publicKey);
    console.log(
      "New Balance : ".rainbow,
      new_balance / Web3.LAMPORTS_PER_SOL,
      "SOL"
    );
  }
}
// ------ping program from anywhere------
async function ping_program(
    connection:Web3.Connection,
    payer: Web3.Keypair
    )
{
    const transaction = new Web3.Transaction();
    const instruction = new Web3.TransactionInstruction({
        //pub key of all accounts , the instruction will read/write
        // an array of account metadata
        keys:[
            {
                pubkey:PROGRAM_DATA_PUBLIC_KEY,
                isSigner:false,
                isWritable:true
            }
        ],
        // isWritable is true cause the account is being written to!
        // Since this write doesn't require a signature from the data account, we set isSigner to false.
        //instruction will be sent to this id
        programId:PROGRAM_ID
        //data : if there is then add but we don't have now
    })
    transaction.add(instruction)
    const transaction_signature = await Web3.sendAndConfirmTransaction(connection,transaction,[payer]);
    console.log(`Transaction https://explorer.solana.com/tx/${transaction_signature}?cluster=devnet`.rainbow);

// we make a transaction
// we make an instruction
// we add the instruction to the transaction
// we send the transaction to the network!
}
// ------main -----------
async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
  const signer = await initialize_key_pair(connection);
  console.log("Your Public Key : ".yellow, signer.publicKey.toBase58());
  await ping_program(connection, signer)
}

main()
  .then(() => {
    console.log("Finished successfully YAY".rainbow);
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
// ----------------------------------------------------------
