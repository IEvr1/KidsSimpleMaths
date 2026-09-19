import { Alert, Platform } from 'react-native';

type ConfirmLabels = {
  yes: string;
  no: string;
};

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  labels: ConfirmLabels,
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: labels.no, style: 'cancel' },
    { text: labels.yes, style: 'destructive', onPress: onConfirm },
  ]);
}
