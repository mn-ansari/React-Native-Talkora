import { useEffect, useRef, useState } from "react";
import {
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  TextInput,
} from "react-native";

import { Text, TouchableOpacity, View } from "@/tw";

type VerificationCodeModalProps = {
  email: string;
  onClose: () => void;
  onComplete: () => void;
};

const CODE_LENGTH = 6;

/**
 * A modal that prompts users to enter a 6-digit email verification code.
 * Automatically completes when all digits are entered.
 * @param email - The email address where the code was sent
 * @param onClose - Callback when the modal should close
 * @param onComplete - Callback when verification is complete
 * @returns A modal component with a 6-digit code input
 */
export function VerificationCodeModal({
  email,
  onClose,
  onComplete,
}: VerificationCodeModalProps) {
  const inputRef = useRef<TextInput>(null);
  const completedRef = useRef(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 400);

    return () => {
      interactionTask.cancel();
      clearTimeout(focusTimer);
    };
  }, []);

  /**
   * Handles verification code input, filters to digits only, and auto-completes when full.
   * @param value - The raw input value
   */
  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);

    if (digits.length === CODE_LENGTH && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close verification"
          onPress={onClose}
          className="flex-1 items-center justify-center bg-[#080D2F]/55 px-[22px]"
        >
          <TouchableOpacity
            activeOpacity={1}
            accessibilityRole="none"
            onPress={() => inputRef.current?.focus()}
            className="w-full max-w-[380px] items-center rounded-[30px] border border-white/80 bg-white px-[22px] pb-[26px] pt-[24px] shadow-overlay"
          >
            <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-[#F1ECFF]">
              <Text className="font-poppins-semibold text-[28px] leading-[34px] text-[#6C3DF5]">
                ✉
              </Text>
            </View>

            <Text className="pt-[15px] text-center font-poppins-bold text-[24px] leading-[31px] text-[#081044]">
              Check your email
            </Text>
            <Text className="pt-[7px] text-center font-poppins text-[13px] leading-[20px] text-[#6E7398]">
              We sent a 6-digit verification code to{"\n"}
              <Text className="font-poppins-semibold text-[#343B6B]">
                {email || "your email address"}
              </Text>
            </Text>

            <View className="relative w-full pt-[22px]">
              <View pointerEvents="none" className="flex-row gap-[7px]">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                  const digit = code[index];
                  const isActive =
                    index === code.length && code.length < CODE_LENGTH;

                  return (
                    <View
                      key={index}
                      className={`h-[54px] flex-1 items-center justify-center rounded-[14px] border bg-[#FAFAFF] ${
                        isActive
                          ? "border-[#7041F6]"
                          : "border-[#E4E2EF]"
                      }`}
                    >
                      <Text className="font-poppins-semibold text-[23px] leading-[29px] text-[#111950]">
                        {digit ?? ""}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <TextInput
                ref={inputRef}
                accessibilityLabel="Six digit verification code"
                autoFocus
                caretHidden
                contextMenuHidden
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                onChangeText={handleCodeChange}
                onPressIn={() => inputRef.current?.focus()}
                selectionColor="transparent"
                showSoftInputOnFocus
                textContentType="oneTimeCode"
                value={code}
                style={{
                  backgroundColor: "transparent",
                  color: "transparent",
                  fontSize: 1,
                  height: 54,
                  left: 0,
                  opacity: 0.02,
                  padding: 0,
                  position: "absolute",
                  right: 0,
                  top: 22,
                  zIndex: 1,
                }}
              />
            </View>

            <Text className="pt-[18px] text-center font-poppins text-[12px] leading-[18px] text-[#8A8FAC]">
              Entering the last digit will continue automatically.
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
