import "./global.css";
import { useState } from "react";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono/400Regular";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HeroUINativeProvider, Button, Input, Select } from "heroui-native";
import { Uniwind } from "uniwind";
import { tokens } from "../src/design-system/tokens";
import { useReducedMotion } from "./useReducedMotion";
import { NativeChatStory } from "./workshop/chat";
import { NativeFinanceStory } from "./workshop/finance";
import type { StoryProps } from "../src/workshop/types";
import { demoCurrencies } from "../src/workshop/finance-fixtures";
import {
  chatNames,
  chatStates,
  financeNames,
  extensionNames,
} from "../src/data/catalog";
import * as F from "./finance";

const names = [...financeNames, ...extensionNames, ...chatNames];

function Foundations() {
  const colors = F.useFinanceTheme();
  return (
    <View style={{ gap: tokens.spacing[6] }}>
      <F.FinanceText kind="heading">Finance UI</F.FinanceText>
      <F.FinanceText tone="muted">
        Shared tokens → HeroUI primitives → finance compositions.
      </F.FinanceText>
      {Object.entries(colors).map(([name, value]) => (
        <View
          key={name}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: tokens.spacing[3],
          }}
        >
          <View
            style={{
              width: tokens.spacing[8],
              height: tokens.spacing[8],
              borderRadius: tokens.radius.md,
              backgroundColor: value,
            }}
          />
          <F.FinanceText kind="caption">
            {name}: {value}
          </F.FinanceText>
        </View>
      ))}
      {Object.keys(tokens.typography).map((name) => (
        <F.FinanceText key={name} kind={name as keyof typeof tokens.typography}>
          {name} · $12,845.00
        </F.FinanceText>
      ))}
    </View>
  );
}

function Catalog() {
  const [name, setName] = useState("Foundations"),
    [currency, setCurrency] = useState("USD"),
    [amount, setAmount] = useState("1000.00"),
    [status, setStatus] = useState("default"),
    [hidden, setHidden] = useState(false),
    [theme, setTheme] = useState("light");
  const c = F.useFinanceTheme();
  const p: StoryProps = {
    currency,
    setCurrency,
    amount,
    setAmount,
    state: status,
    hidden,
    setHidden,
    size: "md",
    variant: "primary",
    notify: (message) => Alert.alert("Component demo", message),
  };
  const content =
    name === "Foundations" ? (
      <Foundations />
    ) : chatNames.includes(name) ? (
      <NativeChatStory name={name} state={status} />
    ) : (
      <NativeFinanceStory name={name} p={p} />
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: tokens.spacing[6],
            gap: tokens.spacing[6],
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <F.FinanceText kind="title">Component catalog</F.FinanceText>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                const next = theme === "light" ? "dark" : "light";
                setTheme(next);
                Uniwind.setTheme(next);
              }}
            >
              {theme === "light" ? "Dark" : "Light"}
            </Button>
          </View>
          <Select
            value={{ value: name, label: name }}
            onValueChange={(v) => {
              if (v) {
                setName(v.value);
                setStatus(chatStates[v.value]?.[0] || "default");
              }
            }}
          >
            <Select.Trigger accessibilityLabel="Choose a story">
              <Select.Value placeholder="Choose an option" />
              <Select.TriggerIndicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="dialog">
                <Select.Close />
                <Select.ListLabel>Choose a story</Select.ListLabel>
                <ScrollView>
                  {["Foundations", ...names].map((n) => (
                    <Select.Item key={n} value={n} label={n} />
                  ))}
                </ScrollView>
              </Select.Content>
            </Select.Portal>
          </Select>
          <View key={name + status}>{content}</View>
          <View
            style={{
              gap: 12,
              borderTopWidth: 1,
              borderColor: c["surface-tertiary"],
              paddingTop: 24,
            }}
          >
            <F.FinanceText kind="subtitle">Playground</F.FinanceText>
            {chatNames.includes(name) ? (
              <Select
                value={{ value: status, label: status }}
                onValueChange={(v) => v && setStatus(v.value)}
              >
                <Select.Trigger accessibilityLabel="Chat state">
                  <Select.Value placeholder="Choose a state" />
                  <Select.TriggerIndicator />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content presentation="dialog">
                    <Select.Close />
                    {chatStates[name].map((v) => (
                      <Select.Item key={v} value={v} label={v} />
                    ))}
                  </Select.Content>
                </Select.Portal>
              </Select>
            ) : (
              <>
                <F.CurrencySelector
                  value={currency}
                  onChange={setCurrency}
                  currencies={demoCurrencies}
                />
                <Input
                  accessibilityLabel="Demo amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <F.SegmentedControl
                  label="Story state"
                  options={["default", "pending", "completed"]}
                  value={status}
                  onChange={setStatus}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setStatus("error")}
                  >
                    Error
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setStatus("empty")}
                  >
                    Empty
                  </Button>
                </View>
              </>
            )}
          </View>
          <F.FinanceText kind="caption" tone="muted">
            33 native additions. All 39 HeroUI catalog primitives are
            re-exported from base.ts. This catalog uses real native components;
            device behavior needs iOS and Android QA. Demo data only.
          </F.FinanceText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export default function App() {
  const reduced = useReducedMotion();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });
  if (!fontsLoaded && !fontError) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{
            animation: reduced ? "disable-all" : undefined,
            textProps: { allowFontScaling: true },
            textInputProps: { allowFontScaling: true },
          }}
        >
          <Catalog />
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
