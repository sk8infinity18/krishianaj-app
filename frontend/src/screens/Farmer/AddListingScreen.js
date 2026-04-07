import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert,
  SafeAreaView, TouchableOpacity, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const AddListingScreen = ({ navigation }) => {
  const { showSuccess, showError, showWarning } = useSnackbar();
  const [form, setForm] = useState({
    crop_name: '',
    quantity: '',
    price_per_unit: ''
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const getImagePayload = (asset, prefix) => {
    const extension = asset.fileName?.split('.').pop() || asset.uri?.split('.').pop() || 'jpg';
    const name = asset.fileName || `${prefix}_${Date.now()}.${extension}`;
    const mimeType = asset.mimeType || asset.type || 'image/jpeg';

    return {
      ...asset,
      fileName: name,
      type: mimeType,
      mimeType,
    };
  };

  // 📸 Camera
  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      const img = getImagePayload(result.assets[0], 'camera');

      setImages(prev => [...prev, img].slice(0, 5));
    }
  };

  // 🖼 Gallery
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset, index) => getImagePayload({
        ...asset,
        fileName: asset.fileName || `image_${Date.now()}_${index}.${asset.uri?.split('.').pop() || 'jpg'}`,
      }, 'image'));

      setImages(prev => [...prev, ...selected].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (!form.crop_name || !form.quantity || !form.price_per_unit) {
    showWarning('Fill all required fields');
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    // ✅ ADD missing fields
    formData.append("crop_name", form.crop_name);
    formData.append("category", form.category || "Vegetables"); // 🔥 DEFAULT
    formData.append("quantity", form.quantity);
    formData.append("unit", form.unit || "kg"); // 🔥 DEFAULT
    formData.append("price_per_unit", form.price_per_unit);

    images.forEach((img) => {
      if (Platform.OS === 'web' && img.file) {
        formData.append('images', img.file, img.fileName);
        return;
      }

      formData.append("images", {
        uri: img.uri,
        type: img.type,
        name: img.fileName,
      });
    });

    await api.createListing(formData);
    showSuccess('Listing added successfully');
    navigation.reset({ index: 0, routes: [{ name: 'FarmerMain' }] });
  } catch (err) {
    console.error(err);
    showError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>List Your Crop {'\u{1F33E}'}</Text>

        {/* Image Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btn} onPress={pickFromCamera}>
            <Text>{'\u{1F4F7}'} Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={pickFromGallery}>
            <Text>{'\u{1F5BC}'} Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Images Preview */}
        <View style={styles.imageRow}>
          {images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => removeImage(i)}>
              <Image source={{ uri: img.uri }} style={styles.img} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <Input
          label="Crop Name *"
          value={form.crop_name}
          onChangeText={set('crop_name')}
          returnKeyType="next"
        />

        <Input
          label="Quantity *"
          value={form.quantity}
          onChangeText={set('quantity')}
          keyboardType="numeric"
          returnKeyType="next"
        />

        <Input
          label="Price per Unit *"
          value={form.price_per_unit}
          onChangeText={set('price_per_unit')}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="Submit"
          onPress={handleSubmit}
          loading={loading}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md },
  title: { ...Typography.h3, marginBottom: 16 },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },

  btn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: Radius.md
  },

  imageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },

  img: {
    width: 80,
    height: 80,
    borderRadius: 10
  }
});

export default AddListingScreen;
