import React from 'react'
/*
  FigmaHost は、Figmaで作成されReactにエクスポートされたコンポーネントを
  取り込むための受け口（ホスト）です。

  使い方（例）:
    1) Figmaからエクスポートしたコンポーネントを `src/figma-components/` に入れる
    2) ここで動的に import して表示するか、propsを渡して埋め込みます。

  このテンプレートではサンプルとして `SampleFigmaWidget` を読み込みます。
*/

import SampleFigmaWidget from '../figma-components/SampleFigmaWidget'

export default function FigmaHost(){
  // 将来的に dynamic import を使って受け入れる形に拡張しやすい構成
  return (
    <div style={{border:'1px dashed #bbb', padding:12, borderRadius:6}}>
      <h4>Figma コンポーネント（サンプル）</h4>
      <SampleFigmaWidget title="サンプル" subtitle="ここにFigmaで作ったUIが入ります" />
      <p style={{fontSize:12, color:'#666'}}>※ figma-components フォルダに React コンポーネントを追加してください。</p>
    </div>
  )
}
