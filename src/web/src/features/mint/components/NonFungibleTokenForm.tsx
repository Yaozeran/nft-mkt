/* Copyright (c) 2026 Yao Zeran
 *
 * The nft mint component*/


import React, { useState } from "react";

import styles from "./NonFungibleTokenForm.module.css"

import axios from "axios";

import { useWeb3 } from "src/contexts/Web3Context";


interface FormData {
  name: string;
  description: string;
  royalty: number;
  file: File | null;
}


const NonFungibleTokenForm: React.FC = () => {

  const { web3, account, nftContract: contract } = useWeb3();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    royalty: 5,
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const uploadFileToIPFS = async (): Promise<string> => {
    if (!formData.file) throw new Error("No file selected");

    const data = new FormData();
    data.append("file", formData.file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

  const uploadMetadataToIPFS = async (fileUrl: string): Promise<string> => {
    const metadata = {
      name: formData.name,
      description: formData.description,
      image: fileUrl,
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

  const mintNonFungibleToken = async () => {
    if (!contract || !web3) return;
    try {
      setLoading(true);

      const fileUrl = await uploadFileToIPFS();

      const metadataUrl = await uploadMetadataToIPFS(fileUrl);

      const royaltyBasisPoints = formData.royalty * 100;

      await contract.methods
        .mintAsset(metadataUrl, royaltyBasisPoints)
        .send({ from: account });

      setFormData({
        name: "",
        description: "",
        royalty: 5,
        file: null,
      });

    } catch (err) {
      console.error(err);
      alert("Mint failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Your NFT</h2>

      <div className={styles.formGroup}>
        <label className={styles.label}>Asset Name</label>
        <input
          className={styles.input}
          id="name"
          placeholder="Enter asset name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          id="description"
          placeholder="Describe your NFT"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Royalty %</label>
        <input
          className={styles.input}
          type="number"
          id="royalty"
          placeholder="Royalty %"
          value={formData.royalty}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Upload File</label>
        <div className={styles.fileUpload}>
          <span className={formData.file ? styles.fileLabelActive : styles.fileLabel}>
            {formData.file ? formData.file.name : "Click to upload file"}
          </span>
          <input
            className={styles.fileInput}
            type="file"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <button
        className={styles.mintBtn}
        onClick={mintNonFungibleToken}
        disabled={loading}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  )
}


export default NonFungibleTokenForm
