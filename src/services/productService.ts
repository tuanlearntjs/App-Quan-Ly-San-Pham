import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';
import { db } from '../config/firebase';
import { Product } from '../types/product';

const PRODUCTS_COLLECTION = 'products';

type ProductInput = {
  tensp: string;
  loaisp: string;
  gia: number | string;
};

function normalizeGia(value: string): number | string {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() !== '' ? parsed : value.trim();
}

async function uploadProductImage(localUri: string, productId: string) {
  if (!CLOUDINARY_CLOUD_NAME.trim() || !CLOUDINARY_UPLOAD_PRESET.trim()) {
    throw new Error('Cloudinary config is missing. Set cloud name and unsigned upload preset.');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: `${productId}-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as { secure_url?: string; error?: { message?: string } };

  if (!response.ok || !data.secure_url) {
    const reason = data.error?.message ?? 'Cloudinary upload failed.';
    throw new Error(reason);
  }

  return data.secure_url;
}

export function subscribeProducts(callback: (products: Product[]) => void) {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const productsQuery = query(productsRef);

  return onSnapshot(productsQuery, (snapshot) => {
    const products = snapshot.docs.map((item) => item.data() as Product);
    products.sort((a, b) => a.tensp.localeCompare(b.tensp));
    callback(products);
  });
}

export async function getProductById(productId: string) {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(productRef);
  if (!snap.exists()) {
    return null;
  }
  return snap.data() as Product;
}

export async function createProduct(input: ProductInput, imageUri: string) {
  const idsanpham = doc(collection(db, PRODUCTS_COLLECTION)).id;
  const hinhanh = await uploadProductImage(imageUri, idsanpham);

  const product: Product = {
    idsanpham,
    tensp: input.tensp.trim(),
    loaisp: input.loaisp.trim(),
    gia: typeof input.gia === 'string' ? normalizeGia(input.gia) : input.gia,
    hinhanh,
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, idsanpham), product);
  return product;
}

export async function updateProduct(productId: string, input: ProductInput, imageUri?: string | null) {
  const existing = await getProductById(productId);
  if (!existing) {
    throw new Error('Product not found.');
  }

  let hinhanh = existing.hinhanh;
  if (imageUri) {
    hinhanh = await uploadProductImage(imageUri, productId);
  }

  const product: Product = {
    idsanpham: productId,
    tensp: input.tensp.trim(),
    loaisp: input.loaisp.trim(),
    gia: typeof input.gia === 'string' ? normalizeGia(input.gia) : input.gia,
    hinhanh,
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, productId), product);
  return product;
}

export async function deleteProduct(product: Product) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, product.idsanpham));
}
