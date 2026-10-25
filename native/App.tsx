import "./global.css";
import React, { useState } from "react";
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
import { NativeChatStory } from "./chat";
import { chatNames, chatStates } from "../src/data/catalog";
import * as F from "./finance";
import { parseMinor } from "../src/design-system/money.mjs";

const names = [
  ...Object.keys(F.financeComponents),
  ...Object.keys(F.extensionComponents),
  ...chatNames,
];
function Catalog() {
  const [name, setName] = useState("Foundations"),
    [currency, setCurrency] = useState("USD"),
    [amount, setAmount] = useState("1000.00"),
    [status, setStatus] = useState("default"),
    [selected, setSelected] = useState(false),
    [period, setPeriod] = useState("Week"),
    [theme, setTheme] = useState("light"),
    c = F.useFinanceTheme();
  const props = { currency, amount };
  let content: React.ReactNode;
  switch (name) {
    case "Foundations":
      content = (
        <View style={{ gap: tokens.spacing[6] }}>
          <F.FinanceText kind="heading">Finance UI</F.FinanceText>
          <F.FinanceText tone="muted">
            Shared tokens → HeroUI primitives → finance compositions.
          </F.FinanceText>
          {Object.entries(c).map(([n, v]) => (
            <View
              key={n}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: v,
                  borderWidth: 0,
                  borderColor: c["surface-tertiary"],
                }}
              />
              <F.FinanceText kind="caption">
                {n}: {v}
              </F.FinanceText>
            </View>
          ))}
          {Object.entries(tokens.typography).map(([n]) => (
            <F.FinanceText key={n} kind={n as keyof typeof tokens.typography}>
              {n} · $12,845.00
            </F.FinanceText>
          ))}
        </View>
      );
      break;
    case "MoneyText":
      content = <F.MoneyText currency={currency} large />;
      break;
    case "CurrencySelector":
      content = <F.CurrencySelector value={currency} onChange={setCurrency} />;
      break;
    case "AmountInput":
      content = (
        <F.AmountInput
          value={amount}
          onChange={setAmount}
          currency={currency}
          onCurrency={setCurrency}
          forceError={status === "error"}
        />
      );
      break;
    case "BalanceCard":
      content = (
        <F.BalanceCard
          currency={currency}
          onSend={() => setName("TransferReview")}
        />
      );
      break;
    case "TransactionRow":
      content = (
        <F.TransactionRow
          currency={currency}
          onPress={() =>
            Alert.alert("Demo transaction", "Alex Morgan · completed")
          }
        />
      );
      break;
    case "TransactionList":
      content = (
        <F.TransactionList currency={currency} empty={status === "empty"} />
      );
      break;
    case "RecipientRow":
      content = (
        <F.RecipientRow
          selected={selected}
          onPress={() => setSelected(!selected)}
        />
      );
      break;
    case "AccountDetails":
      content = <F.AccountDetails />;
      break;
    case "FeeBreakdown":
      content = <F.FeeBreakdown currency={currency} />;
      break;
    case "ExchangeQuote":
      content = <F.ExchangeQuote {...props} />;
      break;
    case "TransferTimeline":
      content = <F.TransferTimeline status={status} />;
      break;
    case "PaymentCard":
      content = <F.PaymentCard />;
      break;
    case "SpendingSummary":
      content = <F.SpendingSummary currency={currency} />;
      break;
    case "LimitMeter":
      content = <F.LimitMeter currency={currency} />;
      break;
    case "VerificationStatus":
      content = <F.VerificationStatus status={status} />;
      break;
    case "TransferReview":
      content = <F.TransferReview {...props} />;
      break;
    case "EmptyState":
      content = <F.EmptyState onAction={() => setName("TransactionList")} />;
      break;
    case "Receipt":
      content = (
        <F.Receipt
          currency={currency}
          status={status === "default" ? "completed" : status}
        />
      );
      break;
    case "NumericKeypad":
      content = (
        <View style={{ gap: 16 }}>
          <F.MoneyText
            minor={parseMinor(amount, currency) ?? 0}
            currency={currency}
            large
          />
          <F.NumericKeypad
            value={amount}
            onChange={setAmount}
            currency={currency}
          />
        </View>
      );
      break;
    case "DatePicker":
      content = <F.DatePicker />;
      break;
    case "ProgressMeter":
      content = <F.ProgressMeter />;
      break;
    case "LineChart":
      content = <F.LineChart period={period} />;
      break;
    case "SegmentedControl":
      content = <F.SegmentedControl value={period} onChange={setPeriod} />;
      break;
    case "Stepper":
      content = <F.Stepper />;
      break;
    case "DataTable":
      content = <F.DataTable currency={currency} />;
      break;
    case "ConfirmationAction":
      content = (
        <F.ConfirmationAction
          onConfirm={() => Alert.alert("Demo confirmed", "No money moved.")}
        />
      );
      break;
    default:
      content = chatNames.includes(name) ? (
        <NativeChatStory name={name} state={status} />
      ) : (
        <F.FinanceText>Select a component.</F.FinanceText>
      );
  }
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
            <Select.Trigger>
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
                <F.CurrencySelector value={currency} onChange={setCurrency} />
                <Input
                  accessibilityLabel="Demo amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <F.SegmentedControl
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
