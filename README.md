slider.js
=========
jQuery Plug-In  
Demo: http://media.ranagram.com/slider  
Demo: http://media.ranagram.com/slider2  

```javascript
$(function(){

	$("#example").slider();

});
```

# Options
- auto: true/false
    スライドを自動で動き出すかどうかを指定します。
    trueだと自動で動き出し、falseだと動き出しません。
    指定しなかった場合の初期値はtrueです。

・build: true
	スライド要素の数の調整を自動で行うかどうかを指定します。
	trueを指定すると、スライド幅に対して要素が少ない場合に、要素を自動でコピーして幅に合うように調整します。
	falseの場合は何もしません。
	指定しなかった場合の初期値はtrueです。

・cellSelector: ".slideCell"
	スライドさせる要素(セル)のクラス名を指定できます。
	指定しなかった場合の初期値は".slideCell"です。

・ctrlSelector: ".slideCtrl"
	スライドをコントロールするコントローラ用要素のクラス名を指定します。
	指定しなかった場合の初期値は".slideCtrl"です。

・ctrlClick: false/true
	コントローラをクリック対応にするかどうかを指定します。
	指定しなかった場合の初期値はfalse（対応しない）です。

・ctrlHover: true/false
	コントローラをホバー対応にするかどうかを指定します。
	初期値はtrue（対応する）です。

・direction: "left"/"right"/"up"/"down"
	スライドを送る方向を指定します。
	初期値は"left"で、右から左へ流れていきます。

・draggable: false/true
	スライドをドラッグで操作可能にするかどうかを指定します。
	初期値はfalse（操作しない）です。
	trueを指定した場合は、loop, auto, pause のオプションが自動でオフになります。

・dragCursorOpen: "open.cur"
	draggableでtrueを指定して、ドラッグ可能にした際のカーソルアイコンのファイル指定ができます。

・dragCursorClose: "close.cur"
	ドラッグ中のカーソルアイコンのファイル指定できます。

・easing: "linear"
	スライドする際のイージングを指定します。
	初期値は"linear"(イージングなし)です。
	jquery.easing.jsを読み込むことで、拡張することができます。

・guideSelector: ".slideGuide"
	スライドさせる要素のガイド用のクラス名を指定します。

・loop: true/false
	スライドをループさせるかどうかを指定します。
	初期値はtrue（ループさせる）です。
	ループさせない場合は、末端まで行くと停止する往復スライドになります。

・once: false/true
	スライドの動きを1コマずつ止めるかどうかを指定します。
	初期値はfalse(止めない)です。

・pause: true
	マウスオーバー時に一時停止するかどうかを指定します。
	初期値はtrue(止める)です。

・reverse: true/false
	コントローラでスライドを回す際に方向を逆向きにするかどうかを指定します。
	初期値はtrue(逆送り)です。

・restart: true/false
	コントローラをクリック対応にした場合に、自動でリスタートするかどうかを指定します。
	初期値はtrue(リスタートする)です。

・restartTime: 3000
	コントローラをクリック対応にし、自動でリスタートする指定にした場合のリスタートまでの待ち時間をミリ秒で指定します。
	初期値は3000(ミリ秒)です。

・shuttle: false/true
	スライドを往復型にするかどうかを指定します。
	初期値はfalse(往復型にしない)です。trueを指定したときは、loop, auto, pause が自動でオフになります。

・speed: 1
	早送りや遅送りの比率を、timeに対する倍率で指定します。

・time: 10
	スライドを動かすスピードを、1px動かすのにかける時間(ミリ秒)として指定します。
	初期値は10msです。
