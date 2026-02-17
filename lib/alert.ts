import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on both web and native.
 * On web, uses window.alert/confirm. On native, uses React Native Alert.
 */
export function showAlert(
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void }>
) {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed && buttons[1]?.onPress) {
                buttons[1].onPress();
            } else if (!confirmed && buttons[0]?.onPress) {
                buttons[0].onPress();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
            if (buttons?.[0]?.onPress) {
                buttons[0].onPress();
            }
        }
    } else {
        Alert.alert(title, message, buttons);
    }
}
