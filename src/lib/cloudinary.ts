// lib/cloudinary.ts

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "makanbajet");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/ddhetfeov/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return await Promise.all(uploadPromises);
};