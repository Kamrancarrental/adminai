
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card } from '../components/Card';
import { Conversation, Message, MessageType, SenderType } from '../types';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NotificationBubble } from '../components/NotificationBubble';

export const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { showNotification } = useNotifications();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const fetchedConversations = await apiService.getConversations();
      setConversations(fetchedConversations);
      if (selectedConversation) {
        // Update the selected conversation with fresh data
        const updatedSelected = fetchedConversations.find(conv => conv.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      } else if (fetchedConversations.length > 0) {
        setSelectedConversation(fetchedConversations[0]); // Select first conversation by default
      }
    } catch (error) {
      showNotification('Failed to fetch conversations.', 'error');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]); // Depend on selectedConversation.id to refetch it specifically

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setReplyMessage('');
    setAiDraft(''); // Clear AI draft when switching conversations
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedConversation) return;

    setIsGeneratingDraft(true);
    setAiDraft('');
    try {
      // Get last customer message for context
      const lastCustomerMessage = selectedConversation.messages
        .filter(msg => msg.sender === SenderType.CUSTOMER)
        .pop();

      if (!lastCustomerMessage) {
        showNotification('No customer message found to generate a draft from.', 'info');
        return;
      }

      // Define system instruction and user prompt separately
      const systemInstruction = "You are a professional e-commerce support assistant. Provide polite and helpful responses.";
      const userPrompt = `Generate a polite and concise reply (max 150 words) to the following customer message.
        Customer Name: ${selectedConversation.customerName}
        Conversation ID: ${selectedConversation.id}
        Message: "${lastCustomerMessage.body}"
        
        Ensure the tone is professional, helpful, and friendly. Avoid repeating information already in the message.`;

      // Call geminiService with separated prompt and instruction
      const draft = await geminiService.generateText(userPrompt, systemInstruction);
      setAiDraft(draft || 'Could not generate a draft at this time. Please try again or compose manually.');
      showNotification('AI draft generated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to generate AI draft.', 'error');
      console.error('Error generating AI draft:', error);
      setAiDraft('Failed to generate draft. Please try again.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleAcceptDraft = () => {
    setReplyMessage(aiDraft);
    setAiDraft('');
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !replyMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        customerId: selectedConversation.customerId,
        sender: SenderType.ADMIN,
        type: selectedConversation.messages[0].type, // Assume type based on first message
        body: replyMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      await apiService.sendMessage(newMessage);
      showNotification('Message sent successfully!', 'success');
      setReplyMessage('');
      setAiDraft(''); // Clear draft after sending
      await fetchConversations(); // Re-fetch conversations to update chat history
    } catch (error) {
      showNotification('Failed to send message.', 'error');
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }, [conversations]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 sm:gap-6">
      {/* Conversation List */}
      <Card className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col overflow-hidden p-0">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            Inbox
            {totalUnread > 0 && (
              <NotificationBubble count={totalUnread} className="static ml-2 -top-0 -right-0" />
            )}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 p-4 text-center">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <Button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center w-full p-4 text-left transition-colors duration-200 relative ${
                  selectedConversation?.id === conv.id
                    ? 'bg-blue-100 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
                variant="ghost"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{conv.customerName}</p>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400">{new Date(conv.lastMessageTimestamp).toLocaleString()}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <NotificationBubble count={conv.unreadCount} />
                )}
              </Button>
            ))
          )}
        </div>
      </Card>

      {/* Chat Window / Message Details */}
      <Card className="flex-1 h-full flex flex-col overflow-hidden p-0">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">{selectedConversation.customerName}</h3>
              <p className="text-sm text-gray-600">
                {selectedConversation.messages[0]?.type === MessageType.EMAIL ? 'Email' : 'WhatsApp'} Conversation
              </p>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === SenderType.ADMIN ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                      message.sender === SenderType.ADMIN
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.subject && <p className="font-semibold mb-1">{message.subject}</p>}
                    <p>{message.body}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Area */}
            <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
              {aiDraft && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  <p className="font-semibold mb-2">AI Draft Suggestion:</p>
                  <p className="whitespace-pre-wrap">{aiDraft}</p>
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button variant="secondary" size="sm" onClick={() => setAiDraft('')}>
                      Discard
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleAcceptDraft}>
                      Use Draft
                    </Button>
                  </div>
                </div>
              )}

              <textarea
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2 resize-none"
                disabled={isSendingMessage || isGeneratingDraft}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleGenerateAiDraft}
                  variant="outline"
                  isLoading={isGeneratingDraft}
                  disabled={!selectedConversation || isGeneratingDraft || isSendingMessage}
                >
                  {isGeneratingDraft ? 'Generating...' : 'Generate AI Draft'}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  variant="primary"
                  isLoading={isSendingMessage}
                  disabled={!selectedConversation || !replyMessage.trim() || isSendingMessage || isGeneratingDraft}
                >
                  {isSendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
