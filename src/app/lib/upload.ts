// lib/upload.ts
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadToFirebase = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `restaurants/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const uploadMultipleToFirebase = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToFirebase(file));
  return await Promise.all(uploadPromises);
};