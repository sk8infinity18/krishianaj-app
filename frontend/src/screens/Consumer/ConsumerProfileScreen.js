import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, resolveAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing } from '../../theme';

const ConsumerProfileScreen = ({ navigation }) => {
  const { updateUser } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((current) => ({ ...current, [key]: val }));
  const getImagePayload = (asset) => {
    const extension = asset.fileName?.split('.').pop() || asset.uri?.split('.').pop() || 'jpg';
    const fileName = asset.fileName || `consumer_${Date.now()}.${extension}`;
    const type = asset.mimeType || asset.type || 'image/jpeg';

    return {
      ...asset,
      fileName,
      type,
      mimeType: type,
    };
  };

  useEffect(() => {
    api.getConsumerProfile().then((data) => {
      setProfile(data.profile);
      setForm({
        delivery_address: data.profile.delivery_address || '',
        delivery_city: data.profile.delivery_city || '',
        delivery_state: data.profile.delivery_state || '',
        delivery_pincode: data.profile.delivery_pincode || '',
      });
    }).catch((err) => showError(err.message));
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showError('Allow gallery access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImg(getImagePayload(result.assets[0]));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));

      if (profileImg) {
        if (Platform.OS === 'web' && profileImg.file) {
          fd.append('profile_image', profileImg.file, profileImg.fileName);
        } else {
          fd.append('profile_image', {
            uri: profileImg.uri,
            type: profileImg.type,
            name: profileImg.fileName,
          });
        }
      }

      const data = await api.updateConsumerProfile(fd);
      await updateUser(data.profile);
      setProfile((current) => ({ ...current, ...data.profile }));
      setEditing(false);
      showSuccess('Profile updated successfully');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const avatarUri = profileImg?.uri || resolveAssetUrl(profile.profile_image);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity onPress={() => setEditing((current) => !current)}>
          <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={editing ? pickImage : undefined} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{profile.first_name?.[0]?.toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.consumerId}>{profile.consumer_id}</Text>
        </View>

        {!editing ? (
          <>
            <Input label="Address" value={form.delivery_address} editable={false} multiline numberOfLines={3} />
            <Input label="City" value={form.delivery_city} editable={false} />
            <Input label="State" value={form.delivery_state} editable={false} />
            <Input label="PIN Code" value={form.delivery_pincode} editable={false} />
          </>
        ) : (
          <>
            <Input label="Address" value={form.delivery_address} onChangeText={set('delivery_address')} multiline numberOfLines={3} />
            <Input label="City" value={form.delivery_city} onChangeText={set('delivery_city')} returnKeyType="next" />
            <Input label="State" value={form.delivery_state} onChangeText={set('delivery_state')} returnKeyType="next" />
            <Input label="PIN Code" value={form.delivery_pincode} onChangeText={set('delivery_pincode')} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={handleSave} />
            <Button title="Save Changes" onPress={handleSave} loading={loading} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  back: { fontSize: 22, color: '#fff' },
  headerTitle: { ...Typography.h3, color: '#fff' },
  editBtn: { color: '#fff' },
  scroll: { padding: Spacing.md },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { marginBottom: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 30 },
  name: { fontSize: 18, marginTop: 10, color: Colors.textPrimary },
  consumerId: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
});

export default ConsumerProfileScreen;
