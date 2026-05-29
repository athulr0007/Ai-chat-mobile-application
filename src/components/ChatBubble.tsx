import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Share, Alert } from 'react-native';
// import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Colors, Spacing, Typography, Layout } from '../constants/theme';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatBubble({ role, content, createdAt }: ChatBubbleProps) {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when bubble is unmounted
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [isSpeaking]);

  const isUser = role === 'user';

  // Toggle Text-to-Speech playback
  const handleTTS = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      // Stop any other currently running speech first
      await Speech.stop();
      
      // Clean content from Markdown symbols for cleaner speech synthesis
      const cleanContent = content.replace(/[*#`_\-]/g, '').trim();

      Speech.speak(cleanContent, {
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
          Alert.alert('TTS Error', 'Voice playback failed on this device.');
        },
      });
    }
  };

  // Long press options (Copy, Share, Read Aloud)
  const handleLongPress = () => {
    Alert.alert(
      'Message Actions',
      'Choose an action for this message',
      [
        {
          text: 'Copy Text',
          onPress: () => {
            Clipboard.setString(content);
          },
        },
        {
          text: 'Share Message',
          onPress: () => {
            Share.share({ message: content });
          },
        },
        {
          text: isSpeaking ? 'Stop Reading' : 'Read Aloud',
          onPress: handleTTS,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const formattedTime = new Date(createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={handleLongPress}
      style={[
        styles.bubbleContainer,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser 
            ? { backgroundColor: activeColors.userBubble, borderBottomRightRadius: 4 }
            : { backgroundColor: activeColors.aiBubble, borderBottomLeftRadius: 4 },
        ]}
      >
        {isUser ? (
          <Text style={[styles.userText, { color: '#FFFFFF' }]}>
            {content}
          </Text>
        ) : (
          <View style={styles.markdownContainer}>
  <Text
    style={{
      color: activeColors.text,
      fontSize: Typography.size.sm,
      lineHeight: 22,
    }}
  >
    {content}
  </Text>

 <View style={[styles.actionsRow, { borderTopColor: activeColors.border }]}>
  <Text style={[styles.timeText, { color: activeColors.textMuted }]}>
    {formattedTime}
  </Text>

  <View style={styles.actionButtons}>
    <TouchableOpacity
      onPress={() => {
        Clipboard.setString(content);
        Alert.alert('Copied', 'Message copied to clipboard');
      }}
      style={[
        styles.ttsButton,
        { backgroundColor: activeColors.background },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name="copy-outline"
        size={14}
        color={activeColors.primary}
      />

      <Text
        style={[
          styles.ttsText,
          { color: activeColors.primary },
        ]}
      >
        Copy
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={handleTTS}
      style={[
        styles.ttsButton,
        { backgroundColor: activeColors.background },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isSpeaking ? 'square' : 'volume-medium'}
        size={14}
        color={isSpeaking ? '#EF4444' : activeColors.primary}
      />

      <Text
        style={[
          styles.ttsText,
          {
            color: isSpeaking
              ? '#EF4444'
              : activeColors.primary,
          },
        ]}
      >
        {isSpeaking ? 'Stop' : 'Speak'}
      </Text>
    </TouchableOpacity>
  </View>
</View>
</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: Spacing.one,
    paddingHorizontal: Spacing.four,
    width: '100%',
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userText: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  markdownContainer: {
    width: '100%',
  },
  actionButtons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeText: {
    fontSize: 10,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowOpacity: 0.02,
    elevation: 1,
  },
  ttsText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
});
