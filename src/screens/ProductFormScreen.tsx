import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createProduct, getProductById, updateProduct } from '../services/productService';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

export function ProductFormScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const isEditMode = !!productId;

  const [tensp, setTensp] = useState('');
  const [loaisp, setLoaisp] = useState('');
  const [gia, setGia] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const previewUri = useMemo(() => newImageUri ?? existingImageUrl, [newImageUri, existingImageUrl]);

  useEffect(() => {
    let mounted = true;

    const loadProductForEdit = async () => {
      if (!productId) {
        return;
      }

      try {
        setIsLoading(true);
        const product = await getProductById(productId);

        if (!product || !mounted) {
          return;
        }

        setTensp(product.tensp);
        setLoaisp(product.loaisp);
        setGia(String(product.gia));
        setExistingImageUrl(product.hinhanh);
      } catch {
        Alert.alert('Error', 'Unable to load product details.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProductForEdit();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to choose product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!tensp.trim() || !loaisp.trim() || !gia.trim()) {
      setErrorMessage('Please fill in tensp, loaisp and gia.');
      return;
    }

    if (!previewUri) {
      setErrorMessage('Please choose an image.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && productId) {
        await updateProduct(productId, { tensp, loaisp, gia }, newImageUri);
      } else {
        await createProduct({ tensp, loaisp, gia }, previewUri);
      }

      navigation.goBack();
    } catch (error) {
      if (error instanceof FirebaseError || error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Unable to save product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">{isEditMode ? 'Edit Product' : 'Add New Product'}</Text>

      <TextInput
        mode="outlined"
        label="Ten san pham (tensp)"
        value={tensp}
        onChangeText={setTensp}
        style={styles.input}
        textColor="#FFFFFF"
        outlineColor="#365486"
        activeOutlineColor="#e94560"
        contentStyle={styles.inputContent}
      />

      <TextInput
        mode="outlined"
        label="Loai san pham (loaisp)"
        value={loaisp}
        onChangeText={setLoaisp}
        style={styles.input}
        textColor="#FFFFFF"
        outlineColor="#365486"
        activeOutlineColor="#e94560"
        contentStyle={styles.inputContent}
      />

      <TextInput
        mode="outlined"
        label="Gia"
        value={gia}
        onChangeText={setGia}
        keyboardType="numeric"
        style={styles.input}
        textColor="#FFFFFF"
        outlineColor="#365486"
        activeOutlineColor="#e94560"
        contentStyle={styles.inputContent}
      />

      <Button mode="outlined" onPress={pickImage}>
        Choose Image
      </Button>

      {!!previewUri && <Image source={{ uri: previewUri }} style={styles.previewImage} />}

      {!!errorMessage && <HelperText type="error">{errorMessage}</HelperText>}

      <Button mode="contained" onPress={handleSave} loading={isSubmitting} disabled={isSubmitting || isLoading}>
        Save Product
      </Button>
      <Button mode="text" onPress={() => navigation.goBack()}>
        Cancel
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: '#16213e',
    flexGrow: 1,
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
  },
  inputContent: {
    color: '#FFFFFF',
    paddingVertical: 8,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
  },
});
