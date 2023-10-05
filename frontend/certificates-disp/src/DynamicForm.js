import React, { useEffect, useState } from 'react';
import {useWallet} from '@suiet/wallet-kit';
import {TransactionBlock} from "@mysten/sui.js/transactions";
import { NFTStorage, File } from 'nft.storage'; 
// require('dotenv').config(); 
import './DynamicForm.css'; 

function DynamicForm() {
  const [fields, setFields] = useState([{ name: '', value: '' }]);
  const [formData, setFormData] = useState({});
  const wallet = useWallet(); 
  const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM2NzcxZDY5Y0RmNjY2RWE4RjI4NzI4RjE1OWZjMDNiZkRkQzEwMTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NjUwMTQwOTE4NCwibmFtZSI6IklwZnNVcGxvYWRLZXkifQ.tDtyrLpGPq8Pibu23mjw2v99USlJ_ylp2_HXM3lzu9U" })
  
  const uploadToIpfs = async( file ) => {
    const objectToUpload = {
      name: "CERTIFICATE",
      description: JSON.stringify(file),
      image: new File(
        [],
        'logo512..png',
        { type: "image/jpg" }
      )
    }; 
    const metadata = await client.store(objectToUpload); 
    console.log(metadata.url); 
    return metadata ;
  } 

  const generateCertificate = async (formData, metadata) => {
    const tx = new TransactionBlock();  
    const packageObjectId = "0x125ce0055bc57a3efc21a08dd23cd778557e0178e04e8f0d3d9a2e3398c6a211";
    tx.moveCall({
      target: `${packageObjectId}::certificate::generate_certificate`,
      arguments: [tx.pure(JSON.stringify(formData)), tx.pure(metadata.url), tx.pure(formData.receiverAddress) ],
    });
    await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
  }

  useEffect(() => {
    if (!wallet.connected) return;
    console.log('connected wallet name: ', wallet.name)
    console.log('account address: ', wallet.account?.address)
    console.log('account publicKey: ', wallet.account?.publicKey)
  }, [wallet.connected]);

  const handleFieldChange = (index, event) => {
    const updatedFields = [...fields];
    updatedFields[index][event.target.name] = event.target.value;
    setFields(updatedFields);
  };

  const handleAddField = () => {
    setFields([...fields, { name: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    const dataToSend = {};
    fields.forEach((field) => {
      if (field.name && field.value) {
        dataToSend[field.name] = field.value;
      }
    });
    dataToSend.senderAddress = wallet.account?.publicKey;
    console.log(`Data to send to backend: ${JSON.stringify(dataToSend)}`);
    setFormData(dataToSend);
    const IpfsUrl = await uploadToIpfs(dataToSend);
    await generateCertificate(dataToSend, IpfsUrl);
  };

  return (
    <div>
      <h1>GENERATE CERTIFICATE</h1>
      <form onSubmit={handleSubmit} className='my-form' >
        <input type="text" name="receiver Address" placeholder="receiver Address" onChange={(e) => handleFieldChange(e)} className='empty-field' required />
        {fields.map((field, index) => (
          <div key={index}>
            <input
              type="text"
              name="name"
              placeholder="Field name"
              value={field.name}
              onChange={(e) => handleFieldChange(index, e)}
              className='empty-field'
            />
            <input
              type="text"
              name="value"
              placeholder="Field value"
              value={field.value}
              onChange={(e) => handleFieldChange(index, e)}
              className='empty-field'
            />
            <button type="button" onClick={() => handleRemoveField(index)} className='btn-submit'>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddField} className='btn-submit' >
          Add Field
        </button>
        <button type="submit" onClick={handleSubmit} className='btn-submit' >Submit</button>
      </form>
    </div>
  );
}

export default DynamicForm;
