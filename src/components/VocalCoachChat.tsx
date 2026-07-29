import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, Square, Send, Volume2, Sparkles, User, Bot, Loader2, AlertCircle } from 'lucide-react';

export interface PhoneticTip {
  word: string;
  ipa: string;
  tip: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  audioUrl?: string;
  phonetics?: PhoneticTip[];
  timestamp: string;
}

interface VocalCoachChatProps {
  sessionId: string;
  initialMessage?: string;
  initialPhonetics?: PhoneticTip[];
}

export const VocalCoachChat: React.FC<VocalCoachChatProps> = ({
  sessionId,
  initialMessage,
  initialPhonetics = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessage) {
      return [
        {
          id: '1',
          sender: 'coach',
          text: initialMessage,
          phonetics: initialPhonetics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    }
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartedAtRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const speakCoachText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('A leitura em voz alta não está disponível neste navegador.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('pt-br'));
    const preferredTerms = ['premium', 'enhanced', 'natural', 'google', 'luciana', 'francisca'];
    utterance.voice =
      portugueseVoices.find((voice) =>
        preferredTerms.some((term) => voice.name.toLowerCase().includes(term)),
      ) ?? portugueseVoices[0] ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('pt')) ?? null;
    utterance.lang = 'pt-BR';
    utterance.rate = 0.93;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Enviar mensagem para a API unificada do n8n
  const sendToN8n = async (payload: { text?: string; audioBlob?: Blob }) => {
    const apiUrl =
      import.meta.env.VITE_COACH_API_URL?.trim() ||
      'https://n8n-65-109-163-218.nip.io/webhook/speek-it-coach-local';
    if (!apiUrl) {
      setError('O Vocal Coach ainda não foi configurado.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('action', 'chat');
    formData.append('sessionId', sessionId);

    if (payload.text) {
      formData.append('text', payload.text);
    }
    if (payload.audioBlob) {
      const extension = payload.audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
      formData.append('audio', payload.audioBlob, `gravacao.${extension}`);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`A API respondeu com o status ${response.status}.`);
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('O Coach não enviou uma resposta. Tente novamente em alguns instantes.');
      }

      let data: { audioBase64?: string; textResponse?: string; error?: string };
      try {
        data = JSON.parse(responseText) as typeof data;
      } catch {
        throw new Error('O Coach enviou uma resposta inválida. Tente novamente em alguns instantes.');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let coachAudioUrl: string | undefined;
      if (data.audioBase64) {
        coachAudioUrl = `data:audio/mp3;base64,${data.audioBase64}`;
      }

      const coachMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'coach',
        text: data.textResponse || 'Desculpe, não consegui preparar a resposta. Vamos tentar novamente?',
        audioUrl: coachAudioUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachMsg]);

      // Tocar áudio da resposta do Coach automaticamente
      if (coachAudioUrl) {
        const audio = new Audio(coachAudioUrl);
        audio.play().catch((err) => console.warn('Autoplay bloqueado pelo navegador:', err));
      } else if (data.textResponse) {
        speakCoachText(data.textResponse);
      }
    } catch (error) {
      console.error('Erro na comunicação com o Coach:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível falar com o Coach agora. Verifique a conexão e tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const textToSend = inputText;
    setInputText('');

    sendToN8n({ text: textToSend });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const supportedType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      setError(null);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError('A gravação foi interrompida pelo navegador. Tente novamente.');
      };

      recorder.onstop = () => {
        const recordingDuration = Date.now() - recordingStartedAtRef.current;
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;

        if (recordingDuration < 1800 || audioBlob.size < 3000) {
          setError('A gravação ficou muito curta. Fale por pelo menos dois segundos antes de enviar.');
          return;
        }

        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: 'Áudio enviado para análise',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        sendToN8n({ audioBlob });
      };

      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setError('Não foi possível acessar o microfone. Autorize o acesso nas configurações do navegador.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !isRecording || recorder.state === 'inactive') return;
    setIsRecording(false);
    recorder.stop();
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header do Chatbot */}
      <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Speek-It Vocal Coach AI
            </h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pronto para treinar sua articulação
            </p>
          </div>
        </div>
      </div>

      {/* Áreas das Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-violet-400 border border-slate-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}
            >
              <p>{msg.text}</p>

              {/* Botão de Áudio da Resposta */}
              {msg.sender === 'coach' && (
                <button
                  onClick={() => msg.audioUrl ? new Audio(msg.audioUrl).play() : speakCoachText(msg.text)}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 rounded-lg text-xs transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Ouvir resposta
                </button>
              )}

              {/* Dicas Fonéticas */}
              {msg.phonetics && msg.phonetics.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Ajustes Fonéticos Recomendados:
                  </span>
                  {msg.phonetics.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/50 text-xs"
                    >
                      <div className="flex items-center justify-between text-indigo-400 font-mono mb-1">
                        <span className="font-semibold text-slate-200">{p.word}</span>
                        <span className="bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded-md">
                          {p.ipa}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{p.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              <span className="block text-[10px] text-slate-400 text-right mt-1.5 opacity-70">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-slate-800/40 p-3 rounded-xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            O Coach está analisando sua fala e preparando o feedback...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      {error && (
        <div role="alert" className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="p-3 bg-slate-800/50 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`p-3 rounded-xl transition-all ${
            isRecording
              ? 'bg-rose-500 text-white animate-bounce'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title={isRecording ? 'Parar gravação' : 'Gravar áudio para o Coach'}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder={isRecording ? 'Ouvindo sua fala em português...' : 'Envie uma fala ou tire dúvidas de comunicação...'}
          disabled={isRecording || isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />

        <button
          onClick={handleSendText}
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
