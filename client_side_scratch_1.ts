//   ----------from scratch-----------------
import * as Web3 from '@solana/web3.js';
import dotenv from 'dotenv';
import 'colors';
dotenv.config();
async function initialize_keypair():Promise<Web3.Keypair>{
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secret_key = Uint8Array.from(secret)
    const key_from_secret = Web3.Keypair.fromSecretKey(secret_key)
    return key_from_secret;
}
async function send_sol(connection:Web3.Connection,amount:number,to:Web3.PublicKey,sender:Web3.Keypair)
{
    const transaction = new Web3.Transaction()
    const send_sol_instruction = Web3.SystemProgram.transfer(
        {
            fromPubkey:sender.publicKey,
            toPubkey:to,
            lamports:amount,
        }
    )
    transaction.add(send_sol_instruction);
    const sig = await Web3.sendAndConfirmTransaction(connection,transaction,[sender])
    console.log(`You can view your transaction on Solana explorer at : \n https://explorer.solana.com/tx/${sig}?cluster=devnet`.yellow)
}
async function main()
{
    const payer = initialize_keypair();
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    await connection.requestAirdrop((await payer).publicKey,Web3.LAMPORTS_PER_SOL*1);
    await send_sol(connection, 0.1*Web3.LAMPORTS_PER_SOL, Web3.Keypair.generate().publicKey, await payer);
}
main().then(()=>{
    console.log("Completed Successfully Yay !".green);
}).catch((err)=>{
    console.log(err);
})
