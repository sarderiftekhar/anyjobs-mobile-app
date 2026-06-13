import { Component, type ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * App-wide error boundary. Without this, a render-time exception in any screen
 * unmounts the whole tree and the user sees a blank white screen — an automatic
 * App Store rejection (Guideline 2.1). Here we show a friendly fallback with a
 * retry instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.warn("[ErrorBoundary] caught render error:", error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Ionicons name="warning-outline" size={48} color="#DC2626" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: "700",
            color: "#1A2230",
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#6B7F94",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          The app hit an unexpected error. Please check your connection and try
          again.
        </Text>
        <TouchableOpacity
          onPress={this.handleReset}
          style={{
            marginTop: 24,
            backgroundColor: "#0064EC",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 12,
            minHeight: 48,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
