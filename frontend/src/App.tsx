import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "bot";
  content: string;
};

type Chat = {
  id: number;
  messages: Message[];
};

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ✅ LOAD chats from MongoDB
  useEffect(() => {
    fetch("http://127.0.0.1:8000/chats")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setChats(data);
          setActiveChatId(data[0].id);
        } else {
          createNewChat();
        }
      })
      .catch(() => {
        console.log("Error loading chats");
      });
  }, []);

  // scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  const updateMessages = (newMessages: Message[]) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: newMessages }
          : chat
      )
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...activeChat.messages, userMsg];
    updateMessages(updated);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await res.json();

      const botMsg: Message = {
        role: "bot",
        content: data.response,
      };

      const finalMessages = [...updated, botMsg];
      updateMessages(finalMessages);

      // ✅ SAVE to MongoDB
      await fetch("http://127.0.0.1:8000/save-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: activeChatId,
          messages: finalMessages,
        }),
      });
    } catch {
      alert("Backend error");
    }

    setLoading(false);
  };

  const createNewChat = async () => {
    const id = Date.now();

    const newChat: Chat = {
      id,
      messages: [{ role: "bot", content: "New chat started 🚀" }],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);

    // ✅ Save new chat immediately
    await fetch("http://127.0.0.1:8000/save-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newChat),
    });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.newChatBtn} onClick={createNewChat}>
          + New Chat
        </button>

        <div style={styles.chatList}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.chatItem,
                background:
                  chat.id === activeChatId ? "#1f2937" : "transparent",
              }}
              onClick={() => setActiveChatId(chat.id)}
            >
              Chat {chat.id}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={styles.main}>
        <div style={styles.header}>🤖 AI Support</div>

        <div style={styles.chatArea}>
          {activeChat?.messages.map((msg, i) => (
            <div key={i} style={styles.messageRow}>
              {msg.role === "bot" && (
                <div style={styles.avatar}>🤖</div>
              )}

              <div
                style={
                  msg.role === "user"
                    ? styles.userBubble
                    : styles.botBubble
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.avatar}>🤖</div>
              <div style={styles.botBubble}>Typing...</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBar}>
          <div style={styles.inputWrapper}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI..."
            />
            <button style={styles.button} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "#0b0f19",
    color: "white",
    overflow: "hidden",
  },
  sidebar: {
    width: "260px",
    minWidth: "260px",
    maxWidth: "260px",
    background: "#020617",
    borderRight: "1px solid #1f2937",
    padding: "12px",
  },
  chatList: { overflowY: "auto" },
  newChatBtn: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    color: "white",
  },
  chatItem: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "6px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "50px",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 0",
  },
  messageRow: {
    maxWidth: "800px",
    margin: "10px auto",
    display: "flex",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    background: "#1f2937",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userBubble: {
    marginLeft: "auto",
    background: "#2563eb",
    padding: "10px",
    borderRadius: "10px",
  },
  botBubble: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
  },
  inputBar: {
    borderTop: "1px solid #1f2937",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
  },
  inputWrapper: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    background: "#020617",
    border: "1px solid #1f2937",
    color: "white",
  },
  button: {
    padding: "10px",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "white",
  },
};

export default App;