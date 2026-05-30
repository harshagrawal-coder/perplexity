import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatApi } from "../Service/chat.api";
import { setChats, setCurrentId, setMessages, setLoading, setError } from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { chats, currentChatId, isLoading, error } = useSelector((state) => state.chat);
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  const fetchChats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await chatApi.getAllChats();
      dispatch(setChats(data.chats));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchChatMessages = useCallback(
    async (chatId) => {
      try {
        dispatch(setLoading(true));
        const data = await chatApi.getChatMessages(chatId);
        dispatch(setCurrentId(chatId));
        return data.messages;
      } catch (err) {
        dispatch(setError(err.message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleMessage = useCallback(
    async ({ chatId, message }) => {
      try {
        dispatch(setLoading(true));
        const data = await chatApi.sendMessage({ chatId, message });
        if (!chatId && data.chatId) {
          dispatch(setCurrentId(data.chatId));
        }
        const chatsData = await chatApi.getAllChats();
        dispatch(setChats(chatsData.chats));
        return data;
      } catch (err) {
        dispatch(setError(err.message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const deleteChat = useCallback(
    async (chatId) => {
      try {
        dispatch(setLoading(true));
        await chatApi.deleteChat(chatId);
        const data = await chatApi.getAllChats();
        dispatch(setChats(data.chats));
        if (currentChatIdRef.current === chatId) {
          dispatch(setCurrentId(null));
          dispatch(setMessages([]));
        }
      } catch (err) {
        dispatch(setError(err.message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const newChat = useCallback(() => {
    dispatch(setCurrentId(null));
  }, [dispatch]);

  return {
    chats,
    currentChatId,
    isLoading,
    error,
    fetchChats,
    fetchChatMessages,
    handleMessage,
    deleteChat,
    newChat,
  };
};
