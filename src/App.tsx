function App() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="mhw-panel max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-mhw-accent mb-4 border-b border-mhw-accent/20 pb-2 font-hud">
          TALISMAN VISION
        </h1>
        <p className="text-lg mb-6">
          モンスターハンターワイルズ 護石認識ツールへようこそ。
          システムの準備が完了しました。
        </p>
        <div className="flex gap-4">
          <button className="mhw-button">
            スキャン開始
          </button>
          <button className="px-4 py-2 border border-mhw-accent/50 text-mhw-accent font-bold rounded hover:bg-mhw-accent/10 transition-all">
            設定
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
