import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  onComplete: () => void;
}

export default function BarcodeMission({ onComplete }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleScan = ({ data }: { data: string }) => {
    if (data) onComplete();
  };

  if (!permission?.granted) {
    return (
      <View style={styles.missionContent}>
        <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.barcode.title')}</Text>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: c.primary }]} onPress={requestPermission}>
          <Text style={styles.submitText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.missionContent}>
      <Text style={[styles.missionTitle, { color: c.text }]}>{t('mission.barcode.title')}</Text>
      <Text style={[styles.instruction, { color: c.textSecondary }]}>{t('mission.barcode.instruction')}</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={handleScan}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  instruction: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  cameraContainer: { width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  camera: { flex: 1 },
  submitBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
