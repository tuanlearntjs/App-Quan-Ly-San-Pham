import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Text } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { logout } from '../services/authService';
import { deleteProduct, subscribeProducts } from '../services/productService';
import { Product } from '../types/product';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeProducts((items) => {
      setProducts(items);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleDelete = (product: Product) => {
    Alert.alert('Confirm Delete', `Delete "${product.tensp}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product);
          } catch {
            Alert.alert('Error', 'Unable to delete product. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Quản lý sản phẩm
        </Text>
        <Button
          mode="contained"
          onPress={handleLogout}
          buttonColor="#e94560"
          textColor="#FFFFFF"
          contentStyle={styles.logoutButtonContent}
        >
          Đăng xuất
        </Button>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.idsanpham}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Cover source={{ uri: item.hinhanh }} />
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium">{item.tensp}</Text>
              <Text>Loai: {item.loaisp}</Text>
              <Text>Gia: {String(item.gia)}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('ProductForm', { productId: item.idsanpham })}>
                Edit
              </Button>
              <Button textColor="#d32f2f" onPress={() => handleDelete(item)}>
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading ? 'Loading products...' : 'No products yet. Tap + to add a product.'}
          </Text>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('ProductForm')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 0,
  },
  headerRow: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    overflow: 'hidden',
  },
  cardContent: {
    paddingTop: 12,
    gap: 4,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
