'use client';

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Usando a interface de mensagem original para manter o estilo
interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Olá! Como posso ajudá-lo hoje?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");

  // A função de envio agora se conecta ao seu back-end Python
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 1. Adiciona a mensagem do usuário à tela imediatamente
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Guarda o texto do input e limpa o campo
    const currentInput = inputValue;
    setInputValue("");

    // 2. Adiciona uma mensagem de "pensando..." para o bot
    const thinkingMessageId = Date.now() + 1;
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      text: "...",
      isUser: false,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    // 3. Tenta se comunicar com o back-end
    try {
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('A resposta da rede não foi OK');
      }

      const data = await response.json();
      
      // 4. Cria a mensagem final do bot com a resposta da API
      const botResponseMessage: Message = {
        id: thinkingMessageId, // Reutiliza o ID
        text: data.response || 'Desculpe, não consegui obter uma resposta.',
        isUser: false,
      };
      
      // Atualiza a mensagem "..." com a resposta real
      setMessages((prev) => prev.map(msg => msg.id === thinkingMessageId ? botResponseMessage : msg));

    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      const errorMessage: Message = {
        id: thinkingMessageId, // Reutiliza o ID
        text: 'Oops! Algo deu errado. Verifique o servidor Python.',
        isUser: false,
      };
      // Atualiza a mensagem "..." com a mensagem de erro
      setMessages((prev) => prev.map(msg => msg.id === thinkingMessageId ? errorMessage : msg));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // O JSX abaixo é o mesmo do design original, garantindo a estética
  return (
    <div className="min-h-screen bg-gray-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <div className="bg-gray-100 px-4 py-3 border-b">
          <h1 className="text-lg font-semibold text-gray-800 text-center">Chatbot</h1>
        </div>

        <div className="h-96 p-4 overflow-y-auto border-b">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="px-4">
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}

