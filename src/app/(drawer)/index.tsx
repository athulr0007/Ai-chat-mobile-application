import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { ApiService, ChatSession, ChatMessage } from '../../services/api';

import ChatBubble from '../../components/ChatBubble';
import TypingIndicator from '../../components/TypingIndicator';
import SkeletonLoader from '../../components/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

export default function ChatScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user, logout, token } = useAuthStore();
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  // ─── Session state ────────────────────────────────────────────────────────
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  /**
   * localMessages holds messages ONLY during the "null → real-session"
   * transition (i.e. the very first message of a brand-new chat).
   * Once the backend hands us a real sessionId we keep appending here
   * until streaming finishes, then we flush to React Query and clear this.
   */
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerX = useSharedValue(-DRAWER_WIDTH);

  // Input & streaming
  const [inputText, setInputText] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);

  /**
   * pendingSessionId is set as soon as the backend metadata callback fires.
   * We store it in a ref so the streaming token callback can read the latest
   * value synchronously without a stale closure.
   */
  const pendingSessionIdRef = useRef<string | null>(null);

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) router.replace('/(auth)/login');
  }, [token]);

  // ─── Drawer ───────────────────────────────────────────────────────────────
  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    drawerX.value = withTiming(open ? 0 : -DRAWER_WIDTH, {
      duration: 300,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  };

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<ChatSession[]>({
    queryKey: ['sessions'],
    queryFn: ApiService.getSessions,
    enabled: !!token,
  });

  const { data: serverMessages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ['messages', activeSessionId],
    queryFn: () => ApiService.getMessages(activeSessionId!),
    enabled: !!token && !!activeSessionId,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const deleteSessionMutation = useMutation({
    mutationFn: ApiService.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if (activeSessionId) setActiveSessionId(null);
    },
    onError: () => Alert.alert('Error', 'Failed to delete chat session.'),
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const scrollToBottom = (delay = 100) => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), delay);
  };

  useEffect(() => {
    if (serverMessages.length > 0) scrollToBottom();
  }, [serverMessages.length]);

  // ─── Decide which list to render ──────────────────────────────────────────
  /**
   * Rules:
   *  • No active session yet  → always use localMessages (new-chat flow)
   *  • Active session exists  → use serverMessages from React Query
   *    (localMessages will be empty by the time we get here because we clear
   *    them on stream-complete)
   */
  const displayMessages: ChatMessage[] =
    activeSessionId === null ? localMessages : serverMessages;

  // ─── Send / Stream ────────────────────────────────────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAiStreaming) return;

    setInputText('');
    setIsAiThinking(true);
    setIsAiStreaming(true);

    const isNewChat = activeSessionId === null;

    if (isNewChat) {
      // ── NEW CHAT: work entirely in localMessages ──────────────────────────
      pendingSessionIdRef.current = null;

      const userMsg: ChatMessage = {
        _id: 'temp-user-' + Date.now(),
        sessionId: 'new-session',
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        _id: 'streaming-message',
        sessionId: 'new-session',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      // Single atomic update → no flicker
      setLocalMessages([userMsg, assistantMsg]);
      scrollToBottom(50);

      const abort = ApiService.streamChat(
        null,
        text,
        // onToken
        (token) => {
          setIsAiThinking(false);
          setLocalMessages((prev) =>
            prev.map((m) =>
              m._id === 'streaming-message' ? { ...m, content: m.content + token } : m
            )
          );
          scrollToBottom(10);
        },
        // onMetadata – backend just created the real session
        (metadata) => {
          pendingSessionIdRef.current = metadata.sessionId;
          // Restamp our local messages with the real sessionId so they
          // look consistent before React Query takes over.
          setLocalMessages((prev) =>
            prev.map((m) => ({ ...m, sessionId: metadata.sessionId }))
          );
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
        // onComplete
        () => {
          const realSessionId = pendingSessionIdRef.current;

          if (realSessionId) {
            // Push the fully-streamed local messages into React Query cache
            // so the transition is seamless (no empty flash).
            setLocalMessages((currentLocal) => {
              queryClient.setQueryData<ChatMessage[]>(
                ['messages', realSessionId],
                currentLocal
              );
              return currentLocal; // keep displaying while query hydrates
            });

            // Switch to server-driven state
            setActiveSessionId(realSessionId);

            // Fetch authoritative messages from server (replaces cache above)
            queryClient.invalidateQueries({ queryKey: ['messages', realSessionId] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });

            // Clear local buffer AFTER a tick so displayMessages never
            // shows an empty list during the session-id switch.
            setTimeout(() => setLocalMessages([]), 0);
          }

          setIsAiStreaming(false);
          setIsAiThinking(false);
          pendingSessionIdRef.current = null;
          scrollToBottom(100);
        },
        // onError
        (error) => {
          setIsAiStreaming(false);
          setIsAiThinking(false);
          setLocalMessages([]);
          pendingSessionIdRef.current = null;
          Alert.alert('Streaming Error', error);
        }
      );

      abortStreamRef.current = abort;
    } else {
      // ── EXISTING CHAT: optimistic update directly in React Query ─────────
      const sessionId = activeSessionId;

      const userMsg: ChatMessage = {
        _id: 'temp-user-' + Date.now(),
        sessionId,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        _id: 'streaming-message',
        sessionId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(['messages', sessionId], (old = []) => [
        ...old,
        userMsg,
        assistantMsg,
      ]);
      scrollToBottom(50);

      const abort = ApiService.streamChat(
        sessionId,
        text,
        // onToken
        (token) => {
          setIsAiThinking(false);
          queryClient.setQueryData<ChatMessage[]>(['messages', sessionId], (old = []) =>
            old.map((m) =>
              m._id === 'streaming-message' ? { ...m, content: m.content + token } : m
            )
          );
          scrollToBottom(10);
        },
        // onMetadata (no-op for existing sessions)
        (_metadata) => {},
        // onComplete
        () => {
          setIsAiStreaming(false);
          setIsAiThinking(false);
          queryClient.invalidateQueries({ queryKey: ['messages', sessionId] });
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
          scrollToBottom(100);
        },
        // onError
        (error) => {
          setIsAiStreaming(false);
          setIsAiThinking(false);
          Alert.alert('Streaming Error', error);
        }
      );

      abortStreamRef.current = abort;
    }
  };

  // ─── Stop streaming ───────────────────────────────────────────────────────
  const handleStopStreaming = () => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    setIsAiStreaming(false);
    setIsAiThinking(false);

    if (activeSessionId) {
      queryClient.invalidateQueries({ queryKey: ['messages', activeSessionId] });
    } else {
      // Aborted before session was created – just clear local buffer
      setLocalMessages([]);
      pendingSessionIdRef.current = null;
    }
  };

  // ─── Navigation helpers ───────────────────────────────────────────────────
  const handleNewChat = () => {
    handleStopStreaming();
    setActiveSessionId(null);
    setLocalMessages([]);
    pendingSessionIdRef.current = null;
    toggleDrawer(false);
  };

  const handleSelectSession = (sessionId: string) => {
    handleStopStreaming();
    setLocalMessages([]);
    pendingSessionIdRef.current = null;
    setActiveSessionId(sessionId);
    toggleDrawer(false);
  };

  const handleDeleteSession = (sessionId: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSessionMutation.mutate(sessionId),
        },
      ]
    );
  };

  // ─── Animated drawer style ────────────────────────────────────────────────
  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerX.value }],
  }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
        <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.headerButton}>
          <Ionicons name="menu-outline" size={24} color={activeColors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>EYE 1</Text>
          <Text style={[styles.headerSubtitle, { color: activeColors.textMuted }]}>
            llama-3.1-8b-instant
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(drawer)/settings')}
          style={styles.headerButton}
        >
          <Ionicons name="cog-outline" size={24} color={activeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {displayMessages.length === 0 && !isAiThinking ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { borderColor: activeColors.primary }]}>
              <Ionicons name="eye" size={40} color={activeColors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: activeColors.text }]}>
              How can I assist you today?
            </Text>
            <Text style={[styles.emptySubtext, { color: activeColors.textMuted }]}>
              Start a new conversation or tap the microphone to speak!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ChatBubble
                role={item.role}
                content={item.content}
                createdAt={item.createdAt}
              />
            )}
            ListFooterComponent={() => (
              <View>
                
                {isAiStreaming && !displayMessages.find((m) => m._id === 'streaming-message')?.content && (
                  <TypingIndicator />
                )}
              </View>
            )}
          />
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              borderTopColor: activeColors.border,
              backgroundColor: activeColors.background,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: activeColors.inputBackground,
                borderColor: activeColors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: activeColors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message EYE 1..."
              placeholderTextColor={activeColors.textMuted}
              multiline
              editable={!isAiStreaming}
            />
          </View>

          {isAiStreaming ? (
            <TouchableOpacity
              onPress={handleStopStreaming}
              style={[styles.sendButton, { backgroundColor: '#EF4444' }]}
            >
              <Ionicons name="stop" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? activeColors.primary : activeColors.border,
                  opacity: inputText.trim() ? 1 : 0.6,
                },
              ]}
            >
              <Ionicons name="arrow-up" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Drawer backdrop */}
      {isDrawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => toggleDrawer(false)}
          style={styles.drawerBackdrop}
        />
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <Animated.View
          style={[styles.drawer, { backgroundColor: activeColors.card }, drawerAnimatedStyle]}
        >
          <SafeAreaView style={styles.drawerSafe}>
            <TouchableOpacity
              onPress={handleNewChat}
              style={[
                styles.newChatBtn,
                { borderColor: activeColors.primary, backgroundColor: activeColors.primaryGlow },
              ]}
            >
              <Ionicons name="add" size={18} color={activeColors.primary} />
              <Text style={[styles.newChatText, { color: activeColors.primary }]}>New Chat</Text>
            </TouchableOpacity>

            <Text style={[styles.sessionsHeader, { color: activeColors.textMuted }]}>
              Recent Chats
            </Text>

            {isLoadingSessions ? (
              <ActivityIndicator style={{ marginTop: Spacing.four }} color={activeColors.primary} />
            ) : sessions.length === 0 ? (
              <Text style={[styles.noSessionsText, { color: activeColors.textMuted }]}>
                No previous chats
              </Text>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.drawerList}
                renderItem={({ item }) => {
                  const isActive = item._id === activeSessionId;
                  const dateText = new Date(item.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <View
                      style={[
                        styles.sessionRow,
                        isActive && { backgroundColor: activeColors.background },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.sessionClickArea}
                        onPress={() => handleSelectSession(item._id)}
                      >
                        <Ionicons
                          name="chatbox-outline"
                          size={16}
                          color={isActive ? activeColors.primary : activeColors.textMuted}
                        />
                        <View style={styles.sessionMeta}>
                          <Text
                            style={[
                              styles.sessionTitle,
                              { color: activeColors.text },
                              isActive && { fontWeight: Typography.weight.semibold },
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={[styles.sessionTime, { color: activeColors.textMuted }]}>
                            {dateText}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteSession(item._id, item.title)}
                        style={styles.sessionDeleteBtn}
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}

            {user && (
              <View style={[styles.drawerUserFooter, { borderTopColor: activeColors.border }]}>
                <View style={styles.userProfileMeta}>
                  <View style={[styles.userAvatar, { backgroundColor: activeColors.primaryGlow }]}>
                    <Text style={[styles.avatarLetter, { color: activeColors.primary }]}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userNameBlock}>
                    <Text
                      style={[styles.userNameText, { color: activeColors.text }]}
                      numberOfLines={1}
                    >
                      {user.name}
                    </Text>
                    <Text
                      style={[styles.userEmailText, { color: activeColors.textMuted }]}
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 64,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 1,
  },
  keyboardContainer: { flex: 1 },
  listContent: { paddingVertical: Spacing.three },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.eight,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  emptyText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.two,
  },
  emptySubtext: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    paddingVertical: 6,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 90,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1000,
    elevation: 40,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  drawerSafe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  newChatBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  newChatText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  sessionsHeader: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.two,
    paddingLeft: Spacing.two,
  },
  noSessionsText: {
    fontSize: Typography.size.sm,
    paddingLeft: Spacing.two,
    marginTop: Spacing.two,
  },
  drawerList: { paddingVertical: Spacing.one },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingRight: Spacing.two,
    marginVertical: 2,
  },
  sessionClickArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sessionMeta: { flex: 1 },
  sessionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  sessionTime: { fontSize: 9, marginTop: 2 },
  sessionDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUserFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 'auto',
  },
  userProfileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  userNameBlock: { flex: 1 },
  userNameText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  userEmailText: { fontSize: 10 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});