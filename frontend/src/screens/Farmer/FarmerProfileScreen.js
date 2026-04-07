import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, SafeAreaView, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, resolveAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const FarmerProfileScreen = ({ navigation, route }) => {
  const { updateUser, logout } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const viewId = route.params?.id;
  const isOwnProfile = !viewId;

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.getFarmerProfile(viewId || undefined).then(d => {
      setProfile(d.profile);
      setForm({
        farm_name: d.profile.farm_name || '',
        farm_location: d.profile.farm_location || '',
        farm_state: d.profile.farm_state || '',
        farm_district: d.profile.farm_district || '',
        bio: d.profile.bio || ''
      });
    });
  }, []);

  // ✅ FIXED IMAGE PICKER
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const img = result.assets[0];

      setProfileImg({
        uri: img.uri,
        type: 'image/jpeg',
        fileName: `profile_${Date.now()}.jpg`
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      if (profileImg) {
        fd.append('profile_image', {
          uri: profileImg.uri,
          type: profileImg.type,
          name: profileImg.fileName,
        });
      }

      const data = await api.updateFarmerProfile(fd);

      updateUser(data.profile);
      setProfile(prev => ({ ...prev, ...data.profile }));
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
        <Text>Loading... 🌱</Text>
      </View>
    );
  }

  const avatarUri = profileImg?.uri || resolveAssetUrl(profile.profile_image);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'My Profile' : profile.first_name + "'s Farm"}
        </Text>

        {isOwnProfile && (
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>
              {editing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={editing ? pickImage : undefined}
            style={styles.avatarWrap}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile.first_name?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>
            {profile.first_name} {profile.last_name}
          </Text>
        </View>

        {!editing ? (
          <>
            <Button title="Sign Out" onPress={async () => { await logout(); showSuccess('Logged out successfully'); }} />
          </>
        ) : (
          <>
            <Input label="Farm Name" value={form.farm_name} onChangeText={set('farm_name')} />
            <Input label="Location" value={form.farm_location} onChangeText={set('farm_location')} />
            <Input label="State" value={form.farm_state} onChangeText={set('farm_state')} />
            <Input label="District" value={form.farm_district} onChangeText={set('farm_district')} />
            <Input label="Bio" value={form.bio} onChangeText={set('bio')} />

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
    backgroundColor: Colors.primaryDark,
    padding: Spacing.md,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  back: { fontSize: 22, color: '#fff' },
  headerTitle: { ...Typography.h3, color: '#fff' },
  editBtn: { color: '#fff' },

  scroll: { padding: Spacing.md },

  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: { color: '#fff', fontSize: 30 },
  name: { fontSize: 18, marginTop: 10 }
});

export default FarmerProfileScreen;
