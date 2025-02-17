import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Input, Icon, Avatar } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || null,
  });

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          const filePath = `${user.id}/${new Date().getTime()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, {
              uri: result.assets[0].uri,
              type: 'image/jpeg',
              name: 'avatar.jpg',
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
          console.error('Upload error:', error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        avatar_url: formData.avatar_url,
      });
      navigation.goBack();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar
          size={120}
          rounded
          source={formData.avatar_url ? { uri: formData.avatar_url } : undefined}
          icon={!formData.avatar_url ? { name: 'person', type: 'material' } : undefined}
          containerStyle={styles.avatar}
        >
          <Avatar.Accessory
            size={36}
            onPress={handleImagePick}
            disabled={loading}
          />
        </Avatar>
      </View>

      <View style={styles.form}>
        <Input
          placeholder="First Name"
          value={formData.first_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
          leftIcon={<Icon name="person" color={colors.primary} size={20} />}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          autoCapitalize="words"
        />

        <Input
          placeholder="Last Name"
          value={formData.last_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
          leftIcon={<Icon name="person" color={colors.primary} size={20} />}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          autoCapitalize="words"
        />

        <Input
          placeholder="Email"
          value={formData.email}
          disabled
          leftIcon={<Icon name="email" color={colors.textLight} size={20} />}
          containerStyle={styles.inputContainer}
          inputContainerStyle={[styles.input, styles.disabledInput]}
          inputStyle={styles.disabledText}
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          buttonStyle={styles.saveButton}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  form: {
    padding: spacing.lg,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  disabledInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  disabledText: {
    color: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
}); 