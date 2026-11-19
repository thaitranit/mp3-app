import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const DEFAULT_URL = "http://192.168.1.9:3000";

function MainApp() {
  const [appUrl, setAppUrl] = useState(DEFAULT_URL);
  const [tempUrl, setTempUrl] = useState(DEFAULT_URL);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleSaveUrl = () => {
    let formatted = tempUrl.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "http://" + formatted;
    }
    setAppUrl(formatted);
    setModalVisible(false);
    setHasError(false);
    setLoading(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#170f23" />

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Chưa kết nối được với Felix MP3</Text>
          <Text style={styles.urlBadge}>Đang gọi tới: {appUrl}</Text>
          <Text style={styles.errorMessage}>
            1. Bạn đã mở file "start.bat" trên máy tính để chạy web chưa?{"\n"}
            2. iPhone 15 Pro Max và máy tính cần cùng kết nối chung một mạng Wi-Fi.{"\n"}
            3. Nếu IP máy tính bị đổi, bạn có thể chỉnh lại địa chỉ bên dưới.
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
              <Text style={styles.buttonText}>Thử kết nối lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.settingButtonText}>Đổi địa chỉ IP / URL</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: appUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          bounces={true}
          pullToRefreshEnabled={true}
          scrollEnabled={true}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
        />
      )}

      {loading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c273ed" />
        </View>
      )}

      {/* Modal chỉnh sửa địa chỉ server */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cài đặt địa chỉ máy chủ</Text>
            <Text style={styles.modalDesc}>
              Nhập IP máy tính (ví dụ: http://192.168.1.9:3000) hoặc link domain:
            </Text>
            <TextInput
              style={styles.input}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://192.168.1.9:3000"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  handleReload();
                }}
              >
                <Text style={styles.reloadModalText}>🔄 Tải lại trang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
                <Text style={styles.saveText}>Lưu & Nạp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#170f23",
  },
  webview: {
    flex: 1,
    backgroundColor: "#170f23",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#170f23",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#170f23",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  urlBadge: {
    fontSize: 13,
    color: "#c273ed",
    backgroundColor: "rgba(194, 115, 237, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#b0b0b0",
    textAlign: "left",
    marginBottom: 24,
    lineHeight: 22,
    alignSelf: "stretch",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#c273ed",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  settingButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  settingButtonText: {
    color: "#ddd",
    fontWeight: "600",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#241838",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#170f23",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#aaa",
    fontWeight: "600",
  },
  reloadModalText: {
    color: "#c273ed",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#c273ed",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

