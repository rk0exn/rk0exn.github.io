export default {
    title: 'MemStressKitについて',
    html: /* html */`
<div class="intro-container">
    <h1>MemStressKit - Windows OOM デバッグツールキット</h1>
    <p>出来ること</p>
    <ul>
        <li>6種類のメモリストレスシナリオによるOOM・ヒープ破壊の再現</li>
        <li>VEH / SEH フィルタによる例外のリアルタイムレポート</li>
        <li>AVX2 / AVX-512 / AVX10.2 のランタイム自動検出と SIMD 書き込み</li>
        <li>DummyDebugger による IsDebuggerPresent() 偽装 / WinDbg 起動対応</li>
        <li>親プロセス監視ウォッチドッグによる自動終了</li>
    </ul>
    <p>ビルド・実行は memstresskit.exe から行います。</p>
    <a href="https://github.com/rk0exn/MemStressKit/" target="_blank">MemStressKitのリポジトリはこちら</a>
</div>
`,
};
